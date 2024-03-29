import { DynamoDB } from "aws-sdk";
import { REPORT_TABLE_NAME } from "../config";
import { ISearchFilter, IVISORInput, IVISORReport, IVISORSmall } from "../formats/report.format";
import {v4 as uuidv4} from 'uuid';
import { deleteItem, filterTable, putItem, scanTable, updateItem } from "./database";
import { AttributeUpdates, ScanInput } from "aws-sdk/clients/dynamodb";
import { buildQuery, getIndexes } from "./report.database";

export function createReport(visor: IVISORInput, callback: (success: boolean, id?: string) => void) {
    const tableName = REPORT_TABLE_NAME;
    const id = uuidv4();
    const report: IVISORReport = {
        ...visor,
        approved: false,
        id,
    }
    const item = DynamoDB.Converter.marshall(report);
    console.log(item);
    putItem(tableName, item, (err) => {
        if (err) {
            console.error(err.message); 
            callback(false);
        } else {
            callback(true, id);
        }
    })
}

export function getReportFromID(id: string, callback: (success: boolean, visor?: IVISORReport) => void) {
    const tableName = REPORT_TABLE_NAME;
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

export function filterReports(filter: ISearchFilter, callback: (success: boolean, data?: IVISORSmall[], count?: number) => void) {
    const tableName = REPORT_TABLE_NAME;
    const query = buildQuery(tableName, filter);
    filterTable(query, (success, data) => {
        if (success && data?.Count && data?.Count > 0 && data.Items) {
            const items = data.Items.map((value) => {
                return DynamoDB.Converter.unmarshall(value) as IVISORSmall;
            });
            
            if (data.Count > 1) {
                const indexes = getIndexes(data.Count, filter.length, filter.from, filter.to);

                callback(true, items.slice(indexes[0], indexes[1]), data.Count);
            } else {
                callback(true, items, data.Count);
            }
        } else if (success) {
            callback(true, undefined, 0);
        } else {
            callback(false);
        }
    });
}

export function deleteReport(id: string, reportName: string, callback: (success: boolean) => void) {
    const tableName = REPORT_TABLE_NAME;
    const key = DynamoDB.Converter.marshall({ id, reportName});

    deleteItem(tableName, key, (success) => {
        callback(success);
    })
}

export function approveReport(id: string, reportName: string, callback: (success: boolean) => void) {
    const tableName = REPORT_TABLE_NAME;
    const key = DynamoDB.Converter.marshall({ id, reportName });
    const updates = {
        approved: {
            Value: { BOOL: true}
        }
    } as AttributeUpdates

    updateItem(tableName, key, updates, (success) => {
        callback(success);
    })
}