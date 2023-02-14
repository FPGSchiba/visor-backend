import { ScanInput } from "aws-sdk/clients/dynamodb";
import { ISearchFilter, IVISORInput, IVISOROutput, IVISORSmallOutput } from "../formats/report.format";
import * as orgDatabase from './org-reports.database';
import * as publicReportsDatabase from './public-report.database';

export function createReport(published: boolean, orgName: string, visor: IVISORInput, callback: (success: boolean, id?: string) => void) {
    if (published) {
        publicReportsDatabase.createReport(visor, (success, id) => {
            if (success && id) {
                callback(true ,id);
            } else {
                callback(false);
            }
        })
    } else {
        orgDatabase.createReport(orgName, visor, (success, id) => {
            if (success && id) {
                callback(true, id);
            } else {
                callback(false);
            }
        })
    }
}

function distinguishedFilter(published: boolean, orgName: string, filter: ISearchFilter, callback: (success: boolean, data?: IVISORSmallOutput[], count?: number) => void) {
    if (published) {
        publicReportsDatabase.filterReports(filter, (success, data, count) => {
            if (success && data && count) {
                const reports = data.map((report) => {
                    return {
                        ...report,
                        published: true
                    } as IVISORSmallOutput
                })
                const ordered = reports.sort(function(a, b) {
                    var textA = a.reportName.toUpperCase();
                    var textB = b.reportName.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
                callback(true, ordered, count);
            } else {
                callback(false);
            }
        })
    } else {
        orgDatabase.filterReports(orgName, filter, (success, data, count) => {
            if (success && data && count) {
                const reports = data.map((report) => {
                    return {
                        ...report,
                        published: false
                    } as IVISORSmallOutput
                })
                const ordered = reports.sort(function(a, b) {
                    var textA = a.reportName.toUpperCase();
                    var textB = b.reportName.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
                callback(true, ordered, count);
            } else {
                callback(false);
            }
        })
    }
}

function combinedFilter(filter: ISearchFilter, orgName: string, callback: (success: boolean, data?: IVISORSmallOutput[], count?: number) => void) {
    const originalFilter = filter;
    const noLengthFilter = {
        ...filter,
        length: undefined,
        from: undefined,
        to: undefined
    };

    // Get Public reports
    let publicCount = 0;
    let publicReports: IVISORSmallOutput[] = [];

    let orgCount = 0;
    let orgReports: IVISORSmallOutput[] = [];
    publicReportsDatabase.filterReports(noLengthFilter, (success, data, count) => {
        if (success && data && count) {
            publicReports = data.map((report) => {
                return {
                    ...report,
                    published: true
                } as IVISORSmallOutput
            });
            publicCount = count;
        } else if (success && typeof(count) == 'number') {
            publicCount = 0;
        } else {
            callback(false);
            return;
        }

        orgDatabase.filterReports(orgName, noLengthFilter, (success, data, count) => {
            if (success && data && count) {
                orgReports = data.map((report) => {
                    return {
                        ...report,
                        published: false
                    } as IVISORSmallOutput
                });
                orgCount = count;
            } else if (success && typeof(count) == 'number') {
                orgCount = 0;
            } else {
                callback(false);
                return;
            }

            const completeCount = publicCount + orgCount;
            if (completeCount > 0) {
                const reports = orgReports.concat(publicReports);
                const indexes = getIndexes(completeCount, originalFilter.length, originalFilter.from, originalFilter.to);
                const ordered = reports.sort(function(a, b) {
                    var textA = a.reportName.toUpperCase();
                    var textB = b.reportName.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                }).slice(indexes[0], indexes[1]);

                callback(true, ordered, completeCount);
                return;
            } else {
                callback(false);
                return;
            }
        });
    });
}

export function filterReports(filter: ISearchFilter, orgName: string, callback: (success: boolean, data?: IVISORSmallOutput[], count?: number) => void) {
    if (filter.published) {
        // Distinguish between the two DBs
        const published = filter.published === 'true';
        distinguishedFilter(published, orgName, filter, (success, data, count) => {
            callback(success, data, count);
        })
    } else {
        combinedFilter(filter, orgName, (success, data, count) => {
            callback(success, data, count);
        })
    }
}

export function getReportFromID(orgName: string, id: string, callback: (success: boolean, data?: IVISOROutput) => void) {
    orgDatabase.getReportFromID(orgName, id, (success, data) => {
        if (success && data) {
            const visor: IVISOROutput = {
                ...data,
                published: false
            }
            callback(true, visor);
        } else if (success) {
            publicReportsDatabase.getReportFromID(id, (success, data) => {
                if (success && data) {
                    const visor: IVISOROutput = {
                        ...data,
                        published: true
                    }
                    callback(success, visor);
                } else {
                    callback(false);
                }
            })
        } else {
            callback(false);
        }
    });
}

export function deleteReport(orgName: string, id: string, callback: (successs: boolean) => void) {
    getReportFromID(orgName, id, (success, data) => {
        if (success && data && !data.approved) { // TODO: Maybe change this
            if (data.published) {
                publicReportsDatabase.deleteReport(id, data.reportName, (success) => {
                    callback(success);
                });
            } else {
                orgDatabase.deleteReport(orgName, id, data.reportName, (success) => {
                    callback(success);
                })
            }
        } else {
            callback(false);
        }
    })
}

export function updateReport(published: boolean, orgName: string, visor: IVISORInput, id: string, callback: (success: boolean, id?: string) => void) {
    deleteReport(orgName, id, (success) => {
        if (success) {
            createReport(published, orgName, visor, (success, id) => {
                if (success && id) {
                    callback(true, id);
                } else {
                    callback(false);
                }
            })
        } else {
            callback(false);
        }
    })
}

export function approveReport(orgName: string, id: string, callback: (success: boolean) => void) {
    getReportFromID(orgName, id, (success, data) => {
        if (success && data) {
            if (data.published) {
                publicReportsDatabase.approveReport(id, data.reportName, (success) => {
                    callback(success);
                });
            } else {
                orgDatabase.approveReport(orgName, id, data.reportName, (success) => {
                    callback(success);
                });
            }
        } else {
            callback(false);
        }
    })
}

export function buildQuery(tableName: string, filter: ISearchFilter): ScanInput {
    let FilterExpression = "";
    let ExpressionAttributeValues: any = {};
    let ExpressionAttributeNames: any = {};
    if (filter.name) {
        const name = 'reportName';
        const attributeKey = `#${name}`;
        const valueKey = `:${name}`;
        ExpressionAttributeNames[`${attributeKey}`] = "reportName";
        ExpressionAttributeValues[`${valueKey}`] = {"S": filter.name};
        FilterExpression += ` and contains (${attributeKey}, ${valueKey})`;
    }

    if (filter.approved) {
        const attributeKey = `#approved`;
        const valueKey = `:approved`;
        ExpressionAttributeNames[`${attributeKey}`] = "approved";
        ExpressionAttributeValues[`${valueKey}`] = {"BOOL": filter.approved.toLowerCase() === 'true'};
        FilterExpression += " and #approved = :approved";
    }

    if (filter.keyword) {
        const attributeKey = `#keyword`;
        const valueKey = `:keyword`;
        ExpressionAttributeNames[`${attributeKey}`] = "keywords";
        ExpressionAttributeValues[`${valueKey}`] = {"S": filter.keyword};
        FilterExpression += " and contains (#keyword, :keyword)";
    }

    if (filter.location) {
        const locationKey = `#location`;
        ExpressionAttributeNames[`${locationKey}`] = "visorLocation";
        if (filter.location.system) {
            const name = 'system';
            const attributeKey = `#${name}`;
            const valueKey = `:${name}`;
            ExpressionAttributeNames[`${attributeKey}`] = "system";
            ExpressionAttributeValues[`${valueKey}`] = {"S": filter.location.system};
            FilterExpression += ` and contains (${locationKey}.${attributeKey}, ${valueKey})`;
        }

        if (filter.location.stellarObject) {
            const name = 'stellarObject';
            const attributeKey = `#${name}`;
            const valueKey = `:${name}`;
            ExpressionAttributeNames[`${attributeKey}`] = "stellarObject";
            ExpressionAttributeValues[`${valueKey}`] = {"S": filter.location.stellarObject};
            FilterExpression += ` and contains (${locationKey}.${attributeKey}, ${valueKey})`;
        }

        if (filter.location.planetLevelObject) {
            const name = 'planetLevelObject';
            const attributeKey = `#${name}`;
            const valueKey = `:${name}`;
            ExpressionAttributeNames[`${attributeKey}`] = "planetLevelObject";
            ExpressionAttributeValues[`${valueKey}`] = {"S": filter.location.planetLevelObject};
            FilterExpression += ` and contains (${locationKey}.${attributeKey}, ${valueKey})`;
        }

        if (filter.location.poiType) {
            const name = 'poiType';
            const attributeKey = `#${name}`;
            const valueKey = `:${name}`;
            ExpressionAttributeNames[`${attributeKey}`] = "poiType";
            ExpressionAttributeValues[`${valueKey}`] = {"S": filter.location.poiType};
            FilterExpression += ` and contains (${locationKey}.${attributeKey}, ${valueKey})`;
        }

        if (filter.location.jurisdiction) {
            const name = 'jurisdiction';
            const attributeKey = `#${name}`;
            const valueKey = `:${name}`;
            ExpressionAttributeNames[`${attributeKey}`] = "jurisdiction";
            ExpressionAttributeValues[`${valueKey}`] = {"S": filter.location.jurisdiction};
            FilterExpression += ` and contains (${locationKey}.${attributeKey}, ${valueKey})`;
        }
    }

    if (filter.meta) {
        const metaKey = `#meta`;
        ExpressionAttributeNames[`${metaKey}`] = "reportMeta";
        if (filter.meta.rsiHandle) {
            const name = 'rsiHandle';
            const attributeKey = `#${name}`;
            const valueKey = `:${name}`;
            ExpressionAttributeNames[`${attributeKey}`] = "rsiHandle";
            ExpressionAttributeValues[`${valueKey}`] = {"S": filter.meta.rsiHandle};
            FilterExpression += ` and contains (${metaKey}.${attributeKey}, ${valueKey})`;
        }

        if (filter.meta.visorCode) {
            const name = 'visorCode';
            const attributeKey = `#${name}`;
            const valueKey = `:${name}`;
            ExpressionAttributeNames[`${attributeKey}`] = "visorCode";
            ExpressionAttributeValues[`${valueKey}`] = {"N": `${filter.meta.visorCode}`};
            FilterExpression += ` and ${metaKey}.${attributeKey} = ${valueKey}`;
        }

        if (filter.meta.scVersion) {
            const name = 'scVersion';
            const attributeKey = `#${name}`;
            const valueKey = `:${name}`;
            ExpressionAttributeNames[`${attributeKey}`] = "scVersion";
            ExpressionAttributeValues[`${valueKey}`] = {"S": filter.meta.scVersion};
            FilterExpression += ` and contains (${metaKey}.${attributeKey}, ${valueKey})`;
        }

        if (filter.meta.followupTrailblazers) {
            const name = 'followupTrailblazers';
            const attributeKey = `#${name}`;
            const valueKey = `:${name}`;
            ExpressionAttributeNames[`${attributeKey}`] = "followupTrailblazers";
            ExpressionAttributeValues[`${valueKey}`] = {"BOOL": filter.meta.followupTrailblazers.toLowerCase() === 'true'};
            FilterExpression += ` and ${metaKey}.${attributeKey} = ${valueKey}`;
        }

        if (filter.meta.followupDiscovery) {
            const name = 'followupDiscovery';
            const attributeKey = `#${name}`;
            const valueKey = `:${name}`;
            ExpressionAttributeNames[`${attributeKey}`] = "followupDiscovery";
            ExpressionAttributeValues[`${valueKey}`] = {"BOOL": filter.meta.followupDiscovery.toLowerCase() === 'true'};
            FilterExpression += ` and ${metaKey}.${attributeKey} = ${valueKey}`;
        }        
    }
    

    const regex = /^\sand\s/;
    FilterExpression = FilterExpression.replace(regex, '');

    if (FilterExpression && ExpressionAttributeNames && ExpressionAttributeValues) {
        return {
            "TableName": tableName,
            "ConsistentRead": false,
            "FilterExpression": FilterExpression,
            "ExpressionAttributeValues": ExpressionAttributeValues,
            "ExpressionAttributeNames": ExpressionAttributeNames,
            "ProjectionExpression": "id, approved, reportMeta, keywords, reportName, visorLocation"
        } as ScanInput
    } else {
        return {
            "TableName": tableName,
            "ConsistentRead": false,
            "ProjectionExpression": "id, approved, reportMeta, keywords, reportName, visorLocation"
        }
    }
}

export function getIndexes(count: number, length?: number, from?: number, to?: number) {
    let startIndex = 0;
    let endIndex = 0;
    if (typeof(length) == 'number') {
        if (typeof(from) == 'number' && typeof(to) == 'number') {
            startIndex = from;
            endIndex = to <= from + length ? to : from + length;
        } else {
            endIndex = length;
        }
    } else {
        endIndex = count;
    }

    return [startIndex, endIndex];
}