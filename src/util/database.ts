import AWS from 'aws-sdk';
import { AttributeDefinitions, CreateTableInput, KeySchema } from 'aws-sdk/clients/dynamodb';
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

    const data = await ddb.createTable(params);
    LOG.info(data);
}
