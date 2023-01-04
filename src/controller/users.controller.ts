import { Request, Response } from 'express';

function createUser(req: Request, res: Response) {
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
}

function listUser(req: Request, res: Response) { 
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
}

function getUser(req: Request, res: Response) {
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
}

function editUser(req: Request, res: Response) {
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
}

function deleteUser(req: Request, res: Response) {
    return res.status(400).json({
        message: 'Not Implemented yet, please try again some other time.',
        code: 'NotImplemented'
    })
}

export default {
    createUser,
    listUser,
    getUser,
    editUser,
    deleteUser
}