import { DynamoDB } from "aws-sdk";
import { TABLE_EXTENSION_REPORTS } from "../config";
import { ISearchFilter, IVISORInput, IVISORReport, IVISORSmall } from "../formats/report.format";
import {v4 as uuidv4} from 'uuid';
import { filterTable, putItem, scanTable } from "./database";
import { ScanInput } from "aws-sdk/clients/dynamodb";

function getTableName(orgName: string): string {
    return `${orgName.toLowerCase()}${TABLE_EXTENSION_REPORTS}`;
}

function buildQuery(tableName: string, filter: ISearchFilter): ScanInput {
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
        ExpressionAttributeValues[`${valueKey}`] = {"SS": [filter.keyword]};
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

function getIndexes(count: number, length?: number, from?: number, to?: number) {
    let startIndex = 0;
    let endIndex = 0;
    if (typeof(length) == 'number') {
        if (typeof(from) == 'number' && typeof(to) == 'number') {
            startIndex = from;
            endIndex = to <= from + length ? to : from + length;
        } else {
            endIndex = length - 1;
        }
    } else {
        endIndex = count - 1;
    }

    return [startIndex, endIndex];
}

export function createReport(orgName: string, visor: IVISORInput, callback: (success: boolean, id?: string) => void) {
    const tableName = getTableName(orgName);
    const id = uuidv4();
    const report: IVISORReport = {
        ...visor,
        approved: false,
        id,
    }
    const item = DynamoDB.Converter.marshall(report);
    putItem(tableName, item, (err) => {
        if (err) {
            console.error(err.message); 
            callback(false);
        } else {
            callback(true, id);
        }
    })
}

export function getReportFromID(orgName: string, id: string, callback: (success: boolean, visor?: IVISORReport) => void) {
    const tableName = getTableName(orgName);
    const query = {
        "TableName": tableName,
        "ConsistentRead": false,
        "FilterExpression": "#d8850 = :d8850",
        "ExpressionAttributeValues": {
            ":d8850": { "S": id},
        },
        "ExpressionAttributeNames": {
            "#d8850": "id"
        }
    } as ScanInput
    filterTable(query, (success, data) => {
        if (success && data?.Items && data.Count == 1) {
            const report = DynamoDB.Converter.unmarshall(data.Items[0]) as IVISORReport;
            callback(true, report);
        } else {
            callback(false);
        }
    })
}

export function filterReports(orgName: string, filter: ISearchFilter, callback: (success: boolean, data?: IVISORSmall[], count?: number) => void) {
    const tableName = getTableName(orgName);
    const query = buildQuery(tableName, filter);
    filterTable(query, (success, data) => {
        if (success && data?.Count && data?.Count > 0 && data.Items) {
            const items = data.Items.map((value) => {
                return DynamoDB.Converter.unmarshall(value) as IVISORSmall;
            });
            
            const indexes = getIndexes(data.Count, filter.length, filter.from, filter.to);

            callback(true, items.slice(indexes[0], indexes[1]), data.Count);
        } else {
            callback(false);
        }
    });
}