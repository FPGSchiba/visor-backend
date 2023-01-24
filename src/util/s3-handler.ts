import AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import { LOG } from './logger';

dotenv.config();

const Bucket = process.env.AWS_S3_BUCKET || '';

const s3Client = new AWS.S3(
    {
        endpoint: process.env.AWS_S3_ENDPOINT || '',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
);

export function createBucket(bucketName: string, callback: (success: boolean) => void ) {
    s3Client.listBuckets((err, data) => {
        if (!err && data && data.Buckets) {
            const buckets = data.Buckets.filter((value) => value.Name == bucketName);
            if (buckets.length == 1) {
                LOG.warn(`Bucket: ${bucketName} does already exist.`);
                callback(true);
            } else {
                const params: AWS.S3.CreateBucketRequest = {
                    Bucket: bucketName,
                }
                s3Client.createBucket(params, (err, data) => {
                    if (err) {
                        console.log(err);
                        LOG.error(err.message);
                        callback(false);
                    } else {
                        console.log(data);
                        callback(true);
                    }
                })
            }
        } else {
            LOG.error(err);
            callback(false);
        }
    })
}

export function uploadObject(objectKey: string, data: Buffer, size: number, mimetype: string, tags: string, callback: (success: boolean) => void) {
    createBucket(Bucket, (success) => {
        if (success) {
            const uploadParams: AWS.S3.PutObjectRequest = {
                Bucket,
                Key: objectKey,
                Body: data,
                ContentLength: size,
                ContentType: mimetype,
                Tagging: tags,
            }
            s3Client.upload(uploadParams, (err) => {
                if (err) {
                    console.log(err);
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
    s3Client.getSignedUrl('getObject', {Key: objectKey}, (err, url) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true, url);
        }
    })
}