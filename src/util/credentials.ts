import AWS from 'aws-sdk';
import { LOG } from './logger';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config();
AWS.config.update({region: process.env.AWS_REGION || 'eu-central-1'});

const VISOR_ADMIN_SECRET = 'VISOR-ADMIN-SECRET';
const secretsmanager = new AWS.SecretsManager(
    {
        endpoint: process.env.AWS_SMNGR_ENDPOINT || '',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
);

export function getAdminSecret(callback: (data: string) => void) {
    var params = {
        SecretId: VISOR_ADMIN_SECRET
    };
    secretsmanager.getSecretValue(params, function(err, data) {
         if (err) {
            if (err.code == 'ResourceNotFoundException') {
                generateAdminSecret((success) => {
                    if (success) {
                        secretsmanager.getSecretValue(params, function(err, data) {
                            if (err) {
                                LOG.error(err.message);
                            } else {
                                callback(data.SecretString || '');
                            }
                        });
                    }
                })
            } else {
                LOG.error(err.message); 
            }
         } else {
            callback(data.SecretString || '');
         }
    });
}

export function generateAdminSecret(callback: (success: boolean) => void) {
    const randomString = crypto.randomBytes(32).toString("hex");
    var params = {
        ClientRequestToken: `${crypto.randomBytes(32).toString("hex")}`,
        Description: "The secret for all VISOR Admins to authenticate.", 
        Name: VISOR_ADMIN_SECRET, 
        SecretString: randomString
    };
    secretsmanager.createSecret(params, function(err, data) {
         if (err) {
            LOG.error(err.message);
            callback(false)
        } else {
            callback(true);
        }
    });
}
