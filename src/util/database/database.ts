import AWS from 'aws-sdk';
import { CreateTableInput, GetItemInput, Key, GetItemOutput, ScanInput, ScanOutput, PutItemInput } from 'aws-sdk/clients/dynamodb';
import * as dotenv from 'dotenv';
import { LOG } from '../logger';
dotenv.config();

AWS.config.update({region: process.env.AWS_REGION || 'eu-central-1'});

const ddb = new AWS.DynamoDB(
    {
        apiVersion: '2012-08-10',
        endpoint: process.env.AWS_DDB_ENDPOINT || '',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
);

export async function createTable(table: CreateTableInput, callbacK?: (success: boolean) => void) {
    const params = {
        ...table,
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
        },
        StreamSpecification: {
            StreamEnabled: false,
        }
    } as CreateTableInput
    try  {
        await ddb.createTable(params, (err, _) => {
            if (!err) {
                if (typeof callbacK !== "undefined") { 
                    callbacK(true);
                }
            } else {
                LOG.error(err.message);
                if (typeof callbacK !== "undefined") { 
                    callbacK(false);
                }
            }
        });
    } catch {
        LOG.error(`Could not create Table: ${table.TableName}`);
        if (typeof callbacK !== "undefined") { 
            callbacK(false);
        }
    }
}

export function getAllTables(callback: (data: AWS.DynamoDB.TableNameList | undefined) => void) {
    ddb.listTables((err, data) => {
        if(!err) {
            callback(data.TableNames);
        } else {
            LOG.error(err.message);
        }
    });
}

export function getItemFromTable(tableName: string, key: Key, callback: (data: GetItemOutput) => void) {
    const params: GetItemInput = {
        TableName: tableName,
        Key: key
    }
    ddb.getItem(params, (err, data) => {
        if (!err) {
            callback(data);
        } else {
            LOG.error(err.message);
        }
    })
}


export function scanTable(tableName: string, callbacK: (data: ScanOutput) => void) {
    const params: ScanInput = {
        TableName: tableName
    }
    ddb.scan(params, (err, data) => {
        if (!err) {
            callbacK(data);
        } else {
            LOG.error(err.message);
        }
    })
}

export function putItem(tableName: string, item: any, callback: (err?: AWS.AWSError) => void) {
    const params: PutItemInput = {
        TableName: tableName,
        Item: item
    }
    ddb.putItem(params, (err, _) => {
        if (err) {
            callback(err);
        } else {
            callback();
        }
    })
}