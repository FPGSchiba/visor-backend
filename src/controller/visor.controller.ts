import { Request, Response } from 'express';
import app from '../app';
import { createReport, filterReports, getReportFromID } from '../util/database/org-reports.database';
import { ISearchFilter } from '../util/formats/report.format';

function checkVisorFormat(visor: any): boolean {
    const reportName = visor.reportName && typeof(visor.reportName) == 'string';
    const visorLocation = visor.visorLocation && typeof(visor.visorLocation) == 'object';
    const reportMeta = visor.reportMeta && typeof(visor.reportMeta) == 'object';
    const locationDetails = visor.locationDetails && typeof(visor.locationDetails) == 'object';
    const navigation = visor.navigation && typeof(visor.navigation) == 'object';
    return reportName && visorLocation && reportMeta && locationDetails && navigation;
}

function createVISOR(req: Request, res: Response) {
    const visor = req.body;
    if (visor && checkVisorFormat(visor)) {
        createReport(res.locals.orgName, visor, (success, id) => {
            if (success && id) {
                return res.status(200).json({
                    message: 'Successfully created the VISOR Report.',
                    code: 'Success',
                    data: {
                        id
                    }
                });
            } else {
                return res.status(500).json({
                    message: 'Could not create the VISOR Report, please check your Information and try again.',
                    code: 'InternalError'
                });
            }
        })
    } else {
        return res.status(400).json({
            message: 'Please provide a valid VISOR Report as a body.',
            code: 'IncompleteBody'
        })
    }
}

function listVISORs(req: Request, res: Response) {
    const { name, location, meta, approved, keyword, length, from, to } = req.query;
    const filter: ISearchFilter = {
        name: name ? typeof(name) == 'string' ? name : undefined : undefined,
        location: location ? typeof(location) == 'string' ? JSON.parse(location) : undefined : undefined,
        meta: meta ? typeof(meta) == 'string' ? JSON.parse(meta) : undefined : undefined,
        approved: approved ? typeof(approved) == 'string' ? approved.toLowerCase() : undefined : undefined,
        keyword: keyword ? typeof(keyword) == 'string' ? keyword : undefined : undefined,
        length: length ? typeof(length) == 'string' ? Number(length) : undefined : undefined,
        from: from ? typeof(from) == 'string' ? Number(from) : undefined : undefined,
        to: to ? typeof(to) == 'string' ? Number(to) : undefined : undefined
    }
    filterReports(res.locals.orgName, filter, (success, data, count) => {
        if (success && data) {
            return res.status(200).json({
                message: 'Successfully filtered the reports.',
                code: 'Success',
                data: {
                    count,
                    reports: data
                }
            });
        } else {
            return res.status(404).json({
                message: 'No reports found with your settings, please try again with different settings.',
                code: 'NotFound'
            })
        }
    });
}

function getVISOR(req: Request, res: Response) {
    const { id } = req.query;
    if (id && typeof(id) == 'string') {
        getReportFromID(res.locals.orgName, id, (success, data) => {
            if (success && data) {
                return res.status(200).json({
                    message: 'Successfully fetched the VISOR Report.',
                    code: 'Success',
                    data
                });
            } else {
                return res.status(404).json({
                    message: 'Could not find the Report specified, please try another id.',
                    code: 'NoFound'
                });
            }
        })
    } else {
        return res.status(400).json({
            message: 'Could not find parameter: "id", please specify a "id" to search for.',
            code: 'IncompleteBody'
        })
    }
}

function updateVISOR(req: Request, res: Response) {
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
}

function approveVISOR(req: Request, res: Response) {
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
}

function deleteVISOR(req: Request, res: Response) {
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
}

function uploadImage(req: Request, res: Response) {
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
}

function getImages(req: Request, res: Response) {
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
}

export default {
    createVISOR,
    listVISORs,
    getVISOR,
    updateVISOR,
    approveVISOR,
    deleteVISOR,
    uploadImage,
    getImages,
}