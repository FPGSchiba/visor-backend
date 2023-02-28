import AWS from 'aws-sdk';
import { Tag, TagSet } from 'aws-sdk/clients/s3';
import * as dotenv from 'dotenv';
import { IVISORImage } from './formats/report.format';
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
        } else if (!err) {
            callback(true, []);
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

export function getDescriptionFromKey(objectKey: string, callback: (success: boolean, description?: string) => void) {
    const params: AWS.S3.GetObjectTaggingRequest = {
        Bucket,
        Key: objectKey,
    }
    s3Client.getObjectTagging(params, (err, data) => {
        if (!err) {
            const descriptionTag = data.TagSet.filter((value) => value.Key == 'description')[0];
            if (descriptionTag) {
                callback(true, descriptionTag.Value);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
}

export async function getSignedUrlForObjects(objectKeys: string[], id: string): Promise<IVISORImage[]> {
    let Successful = true;
    const signedURLs = await Promise.all(objectKeys.map(async (Key) => {
        let signedURL = '';
        let objectDescription = '';
        let finished = false;
        hasObjectId(Key, id, (success, result) => {
            if (success && result) {
                getSignedUrlForObject(Key, (success, link) => {
                    if (success && link) {
                        signedURL = link;
                        getDescriptionFromKey(Key, (descriptionSuccess, description) => {
                            if (descriptionSuccess && description) {
                                objectDescription = description;
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
                })
            } else {
                Successful = false;
                finished = true;
            }
        });

        while (!finished) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return {url: signedURL, description: objectDescription, name: Key};
    }));
    return signedURLs.filter((value) => value.url != '' && value.description != '' && value.name != '');
}

export function deleteObject(key: string, callback: (success: boolean) => void) {
    const params: AWS.S3.DeleteObjectRequest = {
        Key: key,
        Bucket
    }
    s3Client.deleteObject(params, (err, data) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true);
        }
    })
}

export function getTagsForObject(key: string, callback: (success: boolean, tags?: TagSet) => void) {
    const params = {
        Key: key,
        Bucket
    }
    s3Client.getObjectTagging(params, (err, data) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true, data.TagSet);
        }
    })
}

export function setTagsForObject(key: string, tags: TagSet, callback: (success: boolean) => void) {
    const params: AWS.S3.PutObjectTaggingRequest = {
        Key: key,
        Bucket,
        Tagging: { TagSet: tags}
    }
    s3Client.putObjectTagging(params, (err, _) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true);
        }
    })
}

export async function deleteAllObjects(images: IVISORImage[]): Promise<boolean> {
    let success = true;
    let count = 0;
    images.forEach((image) => {
        deleteObject(image.name, (success) => {
            if (!success) {
                success = false
            }
            count++;
        })
    });

    while (count < images.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return success;
}

export async function updateAllImageReportIds(images: IVISORImage[], id: string): Promise<boolean> {
    let success = true;
    let count = 0;
    
    images.forEach((image) => {
        getTagsForObject(image.name, (success, tags) => {
            if (success && tags) {
                const newTags = tags.map((value) => { 
                    if (value.Key == 'id') {
                        const tag: Tag = {
                            Key: value.Key,
                            Value: id
                        }
                        return tag;
                    } else {
                        return value;
                    }
                });
                setTagsForObject(image.name, newTags, (success) => {
                    if (!success) {
                        success = false;
                    }
                    count++;
                })
            }
        })
    })

    while (count < images.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return success;
}