import { Request, Response } from 'express';

function createVISOR(req: Request, res: Response) {
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
}

function listVISORs(req: Request, res: Response) {
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
}

function getVISOR(req: Request, res: Response) {
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
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

export default {
    createVISOR,
    listVISORs,
    getVISOR,
    updateVISOR,
    approveVISOR,
    deleteVISOR,
}