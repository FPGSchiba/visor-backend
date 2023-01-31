import AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import { LOG } from './logger';

dotenv.config();

const Bucket = process.env.AWS_S3_BUCKET || '';

function getS3ClientConfig() {
    if (process.env.AWS_S3_ENDPOINT && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        return new AWS.S3(
            {
                endpoint: process.env.AWS_S3_ENDPOINT,
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
        );
    }  else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        return new AWS.S3(
            {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
        );
    } else {
        return new AWS.S3();
    }
}

const s3Client = getS3ClientConfig();

export function createBucket(bucketName: string, callback: (success: boolean) => void ) {
    s3Client.listBuckets((err, data) => {
        if (!err && data && data.Buckets) {
            const buckets = data.Buckets.filter((value) => value.Name == bucketName);
            if (buckets.length == 1) {
                callback(true);
            } else {
                LOG.warn(`Bucket: ${bucketName} does not exist. Attempting to create Bucket now...`);
                const params: AWS.S3.CreateBucketRequest = {
                    Bucket: bucketName,
                }
                s3Client.createBucket(params, (err, _) => {
                    if (err) {
                        LOG.error(err.message);
                        callback(false);
                    } else {
                        callback(true);
                    }
                })
            }
        } else {
            LOG.error(err.message);
            callback(false);
        }
    })
}

export function uploadObject(objectKey: string, data: Buffer, size: number, mimetype: string, tags: string, callback: (success: boolean) => void) {
    createBucket(Bucket, (success) => {
        if (success) {
            const uploadParams: AWS.S3.PutObjectRequest = {
                Bucket: Bucket,
                Key: objectKey,
                Body: data,
                ContentLength: size,
                ContentType: mimetype,
                Tagging: tags,
            }
            s3Client.upload(uploadParams, (err) => {
                if (err) {
                    LOG.error(err.message);
                    callback(false);
                } else {
                    callback(true)
                }
            });
        } else {
            callback(false);
        }
    })
}

export function getSignedUrlForObject(objectKey: string, callback: (success: boolean, link?: string) => void) {
    s3Client.getSignedUrl('getObject', {Key: objectKey, Bucket, Expires: 3600}, (err, url) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true, url);
        }
    })
}

export function listObjectsInOrg(orgName: string, callback: (success: boolean, data?: string[]) => void) {
    const params: AWS.S3.ListObjectsRequest = {
        Bucket,
        Prefix: `${orgName}/`
    }
    s3Client.listObjects(params, (err, data) => {
        if (!err && data.Contents && data.Contents.length > 0) {
            const keys = data.Contents.map((value) => {
                return value.Key || '';
            });
            callback(true, keys);
        } else {
            LOG.error(err.message);
            callback(false);
        }
    })
}

export function hasObjectId(objectKey: string, id: string, callback: (success: boolean, result?: boolean) => void) {
    const params: AWS.S3.GetObjectTaggingRequest = {
        Bucket,
        Key: objectKey,
    }
    s3Client.getObjectTagging(params, (err, data) => {
        if (!err) {
            const hasID = data.TagSet.filter((value) => value.Value == id).length >= 1;
            callback(true, hasID);
        } else {
            callback(false);
        }
    })
}

export async function getSignedUrlForObjects(objectKeys: string[], id: string): Promise<string[]> {
    let Successful = true;
    const signedURLs = await Promise.all(objectKeys.map(async (Key) => {
        let signedURL = '';
        let finished = false;
        hasObjectId(Key, id, (success, result) => {
            if (success && result) {
                getSignedUrlForObject(Key, (success, link) => {
                    if (success && link) {
                        signedURL = link;
                        finished = true;
                    } else {
                        Successful = false;
                        finished = true;
                    }
                })
            } else {
                Successful = false;
                finished = true;
            }
        });

        while (!finished) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return signedURL;
    }));
    return signedURLs.filter((value) => value != '');
}