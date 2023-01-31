import AWS from 'aws-sdk';
import { CreateTableInput, GetItemInput, Key, GetItemOutput, ScanInput, ScanOutput, PutItemInput, DeleteItemInput, QueryOutput, QueryInput, UpdateItemInput, AttributeUpdates, DeleteTableInput, DescribeTableInput } from 'aws-sdk/clients/dynamodb';
import * as dotenv from 'dotenv';
import { LOG } from '../logger';
dotenv.config();

AWS.config.update({region: process.env.AWS_REGION || 'eu-central-1'});

function getDynamoDBConfig() {
    if (process.env.AWS_DDB_ENDPOINT && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        return new AWS.DynamoDB(
            {
                apiVersion: '2012-08-10',
                endpoint: process.env.AWS_DDB_ENDPOINT,
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
        )
    } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        return new AWS.DynamoDB(
            {
                apiVersion: '2012-08-10',
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
        ) 
    } else {
        return new AWS.DynamoDB({apiVersion: '2012-08-10'})
    }  ;
    
}

const ddb = getDynamoDBConfig();

export function createTable(table: CreateTableInput, callback: (success: boolean) => void) {
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
        ddb.createTable(params, (err, _) => {
            if (!err) {
                waitForCreationToFinish(table.TableName, callback);
            } else {
                LOG.error(err.message);
                callback(false);
            }
        });
    } catch {
        LOG.error(`Could not create Table: ${table.TableName}`);
        callback(false);
    }
}

export function deleteTable(tableName: string, callback: (success: boolean) => void) {
    const params = {
        TableName: tableName
    } as DeleteTableInput

    ddb.deleteTable(params, (err, _) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true);
        }
    })
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

export function getItemFromTable(tableName: string, key: Key, callback: (success: boolean, data?: GetItemOutput) => void) {
    const params: GetItemInput = {
        TableName: tableName,
        Key: key
    }
    ddb.getItem(params, (err, data) => {
        if (!err) {
            callback(true, data);
        } else {
            LOG.error(err.message);
            callback(false);
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


export function deleteItem(tableName: string, key: Key, callback: (success: boolean) => void) {
    const params: DeleteItemInput = {
        TableName: tableName,
        Key: key
    }
    ddb.deleteItem(params, (err, data) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true);
        }
    })
}

export function queryTable(query: QueryInput, callback: (success: boolean, data?: QueryOutput) => void) {
    ddb.query(query, (err, data) => {
        if (err) {
            LOG.error(err.message);
            callback(false)
        } else {
            callback(true, data);
        }
    })
}

export function filterTable(params: ScanInput, callback: (success: boolean, data?: ScanOutput) => void) {
    ddb.scan(params, (err, data) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true, data);
        }
    })
}

export function updateItem(tableName: string, key: Key, updates: AttributeUpdates, callback: (success: boolean) => void) {
    const params = {
        TableName: tableName,
        AttributeUpdates: updates,
        Key: key,
    } as UpdateItemInput
    ddb.updateItem(params, (err, _) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true);
        }
    })
}

export function waitForCreationToFinish(tableName: string, callback: (success: boolean) => void) {
    ddb.describeTable({TableName: tableName}, (_, data) => {
        if (data.Table?.TableStatus == 'CREATING') {
            waitForCreationToFinish(tableName, callback);
            return;
        } else {
            callback(true);
        }
    })
}