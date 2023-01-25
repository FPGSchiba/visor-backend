import { UploadedFile } from 'express-fileupload';
import { PUBLIC_SUBFOLDER_NAME } from './config';
import { getReportFromID } from './database/report.database';
import {v4 as uuidv4} from 'uuid';
import { getSignedUrlForObject, getSignedUrlForObjects, listObjectsInOrg, uploadObject } from './s3-handler';

// Upload image
// -> Tag report id
// -> subfolder: org or public

export function uploadImageForId(image: UploadedFile, id: string, orgName: string, callback: (success: boolean, link?: string) => void) {
    getReportFromID(orgName, id, (success, data) => {
        if (success && data && data.published) {
            const subfolderName = PUBLIC_SUBFOLDER_NAME;
            const imageID = uuidv4();
            const fileExtension = image.name.match(/\..{3,9}$/)?.[0] || '.png';
            const objectKey = `${subfolderName}/${imageID}${fileExtension}`;
            const tags = `id=${id}&reportName=${data.reportName}`;
            uploadObject(objectKey, image.data, image.size, image.mimetype, tags, (success) => {
                if (success) {
                    getSignedUrlForObject(objectKey, (success, link) => {
                        callback(success, link);
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
            const tags = `id=${id}&reportName=${data.reportName}`;
            uploadObject(objectKey, image.data, image.size, image.mimetype, tags, (success) => {
                if (success) {
                    getSignedUrlForObject(objectKey, (success, link) => {
                        callback(success, link);
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
export function getAllImagesForId(orgName: string, id: string, callback: (success: boolean, links?: string[]) => void) {
    getReportFromID(orgName, id, (success, report) => {
        if (success && report) {
            const prefix = report.published ? 'public' : orgName;
            listObjectsInOrg(prefix, async (success, data) => {
                if (success && data) {
                    const links = await getSignedUrlForObjects(data, id);
                    callback(true, links);
                } else {
                    callback(false)
                }
            })
        } else {
            callback(false);
        }
    })
}