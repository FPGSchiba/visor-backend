import { DynamoDB } from "aws-sdk";
import { TABLE_EXTENSION_REPORTS } from "../config";
import { ISearchFilter, IVISORInput, IVISOROutput, IVISORReport, IVISORSmall } from "../formats/report.format";
import {v4 as uuidv4} from 'uuid';
import { deleteItem, filterTable, putItem, scanTable, updateItem } from "./database";
import { AttributeUpdates, ScanInput } from "aws-sdk/clients/dynamodb";
import { buildQuery, getIndexes } from "./report.database";

function getTableName(orgName: string): string {
    return `${orgName.toLowerCase()}${TABLE_EXTENSION_REPORTS}`;
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
        } else if (success) {
            callback(true);
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

            if (data.Count > 1) {
                const indexes = getIndexes(data.Count, filter.length, filter.from, filter.to);
                const ordered = items.sort(function(a, b) {
                    var textA = a.reportName.toUpperCase();
                    var textB = b.reportName.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                }).slice(indexes[0], indexes[1])

                callback(true, ordered, data.Count);
            } else {
                const ordered = items.sort(function(a, b) {
                    var textA = a.reportName.toUpperCase();
                    var textB = b.reportName.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
                callback(true, ordered, data.Count);
            }
        } else if (success) {
            callback(true, undefined, 0);
        } else {
            callback(false);
        }
    });
}

export function deleteReport(orgName: string, id: string, reportName: string, callback: (success: boolean) => void) {
    const tableName = getTableName(orgName);
    const key = DynamoDB.Converter.marshall({ id, reportName});

    deleteItem(tableName, key, (success) => {
        callback(success);
    })
}

export function approveReport(orgName: string, id: string, reportName: string, callback: (success: boolean) => void) {
    const tableName = getTableName(orgName);
    const key = DynamoDB.Converter.marshall({ id, reportName });
    const updates = {
        approved: {
            Value: { BOOL: true}
        }
    } as AttributeUpdates

    updateItem(tableName, key, updates, (success) => {
        callback(success);
    });
}