import AWS from 'aws-sdk';
import { AttributeDefinitions, CreateTableInput, GetItemInput, KeySchema, Key, GetItemOutput, ScanInput, ScanOutput, PutItemInput, PutItemOutput } from 'aws-sdk/clients/dynamodb';
import * as dotenv from 'dotenv';
import { LOG } from './logger';
dotenv.config();

AWS.config.update({region: process.env.AWS_REGION || 'eu-central-1'});

const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10', endpoint: process.env.AWS_DDB_ENDPOINT || ''});

export async function createTable(tableName: string, keySchema: KeySchema, attributeDefinitions: AttributeDefinitions) {
    const params = {
        AttributeDefinitions: attributeDefinitions,
        KeySchema: keySchema,
        TableName: tableName,
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        },
        StreamSpecification: {
            StreamEnabled: false
        }
    } as CreateTableInput
    try  {
        await ddb.createTable(params, (err, _) => {
            if (!err) {
                LOG.info(`Created Table: ${params.TableName}`);
            } else {
                LOG.error(err.message);
            }
        });
    } catch {
        LOG.error(`Could not create Table: ${tableName}`);
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

export function putItem(tableName: string, item: any) {
    const params: PutItemInput = {
        TableName: tableName,
        Item: item
    }
    ddb.putItem(params, (err, _) => {
        if (err) {
            LOG.error(err.message);
        }
    })
}
