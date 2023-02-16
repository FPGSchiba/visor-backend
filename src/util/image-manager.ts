import { UploadedFile } from 'express-fileupload';
import { PUBLIC_SUBFOLDER_NAME } from './config';
import { getReportFromID } from './database/report.database';
import {v4 as uuidv4} from 'uuid';
import { deleteAllObjects, deleteObject, getSignedUrlForObject, getSignedUrlForObjects, getTagsForObject, listObjectsInOrg, setTagsForObject, updateAllImageReportIds, uploadObject } from './s3-handler';
import { IVISORImage } from './formats/report.format';
import { Tag } from 'aws-sdk/clients/s3';

// Upload image
// -> Tag report id
// -> subfolder: org or public

export function uploadImageForId(image: UploadedFile, description: string, id: string, orgName: string, callback: (success: boolean, image?: IVISORImage) => void) {
    getReportFromID(orgName, id, (success, data) => {
        if (success && data && data.published) {
            const subfolderName = PUBLIC_SUBFOLDER_NAME;
            const imageID = uuidv4();
            const fileExtension = image.name.match(/\..{3,9}$/)?.[0] || '.png';
            const objectKey = `${subfolderName}/${imageID}${fileExtension}`;
            const tags = `id=${id}&reportName=${data.reportName}&description=${description}`;
            uploadObject(objectKey, image.data, image.size, image.mimetype, tags, (success) => {
                if (success) {
                    getSignedUrlForObject(objectKey, (success, link) => {
                        if (success && link) {
                            callback(success, {url: link, description, name: objectKey});
                        } else {
                            callback(false);
                        }
                    })
                } else {
                    callback(false);
                }
            });
        } else if (success && data && !data.published) {
            const subfolderName = orgName;
            const imageID = uuidv4();
            const fileExtension = image.name.match(/\..{3,9}$/)?.[0] || '.png';
            const objectKey = `${subfolderName}/${imageID}${fileExtension}`;
            const tags = `id=${id}&reportName=${data.reportName}&description=${description}`;
            uploadObject(objectKey, image.data, image.size, image.mimetype, tags, (success) => {
                if (success) {
                    getSignedUrlForObject(objectKey, (success, link) => {
                        if (success && link) {
                            callback(success, {url: link, description, name: objectKey});
                        } else {
                            callback(false);
                        }
                    })
                } else {
                    callback(false);
                }
            })
        } else {
            callback(false);
        }
    });
}

// Get Image List for id
export function getAllImagesForId(orgName: string, id: string, callback: (success: boolean, images?: IVISORImage[]) => void) {
    getReportFromID(orgName, id, (success, report) => {
        if (success && report) {
            const prefix = report.published ? 'public' : orgName;
            listObjectsInOrg(prefix, async (success, data) => {
                if (success && data) {
                    const links = await getSignedUrlForObjects(data, id);
                    callback(true, links);
                } else {
                    callback(true, [])
                }
            })
        } else {
            callback(false);
        }
    })
}

// Delete Object
export function deleteImageFromKey(key: string, callback: (success: boolean) => void) {
    deleteObject(key, (success) => {
        callback(success);
    })
}

// Get Object Tags
// Set Object Tags
export function updateDescriptionFromKey(key: string, description: string, callback: (success: boolean) => void) {
    getTagsForObject(key, (success, tags) => {
        if (success && tags) {
            const newTags = tags.map((value) => { 
                if (value.Key == 'description') {
                    const tag: Tag = {
                        Key: value.Key,
                        Value: description
                    }
                    return tag;
                } else {
                    return value;
                }
            });
            setTagsForObject(key, newTags, (success) => {
                callback(success);
            })
        }
    })
}

// Get all objects with ID && Tags
// Set all Objects new Tags 
export function updateImagesReportId(orgName: string, oldId: string, newId: string, callback: (success: boolean) => void) {
    getAllImagesForId(orgName, oldId, async (success, images) => {
        if (success && images && images.length > 0) {
            const result = await updateAllImageReportIds(images, newId);
            callback(result);
        } else if (images && images.length == 0) {
            callback(true);
        } else {
            callback(false);
        }
    })
}

// Get all objects with ID
// Delete all images
export function deleteImagesForId(orgName: string, id: string, callback: (success: boolean) => void) {
    getAllImagesForId(orgName, id, async (success, images) => {
        if (success && images && images.length > 0) {
            const result = await deleteAllObjects(images);
            callback(result);
        } else if (images && images.length == 0) {
            callback(true);
        } else {
            callback(false);
        }
    })
}