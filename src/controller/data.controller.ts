import { Request, Response } from 'express';
import { addPlanetLevelObjectToStellarObject, addStellarObjectToSystem, createCompleteSystem, deleteCompleteSystem, deletePlanetLevelObjectFromID, deleteStellarObjectFromID, getAllSystemsSmall, getCompleteSystemFromID } from '../util/database/systems.database';
import { IPlanetLevelObjectInput, IStellarObjectInput, ISystemInput } from '../util/formats/systems.format';

function dataCreateSystem(req: Request, res: Response) {
    const system = req.body;
    if (system) {
        createCompleteSystem(system as ISystemInput, (success) => {
            if (success) {
                return res.status(200).json({
                    message: 'Successfully created new system.',
                    code: 'Success'
                })
            } else {
                return res.status(500).json({
                    message: 'Please check your body for creating a System and try again.',
                    code: 'InternalError'
                })
            }
        })
    } else {
        return res.status(400).json({
            message: 'Please provide a body to create a System from.',
            code: 'IncompleteBody'
        })
    }
}

function dataCreateStellarObject(req: Request, res: Response) {
    const { id } = req.query;
    const stellarObject = req.body;
    if (id && stellarObject && typeof(id) == 'string') {
        addStellarObjectToSystem(id, stellarObject as IStellarObjectInput, (success) => {
            if (success) {
                return res.status(200).json({
                    message: 'Successfully created new Stellar Object.',
                    code: 'Success'
                })
            } else {
                return res.status(404).json({
                    message: 'Either the system could not be found or there was an error within the given body. Please check both and try again.',
                    code: 'NotFound'
                });
            }
        })
    } else {
        return res.status(400).json({
            message: 'Please ensure, you have a Parameter called: "id" with the system id and a body holding a Stellar Object.',
            code: 'IncompleteBody'
        })
    }
}

function dataCreatePlanetLevelObject(req: Request, res: Response) {
    const { id } = req.query;
    const planetLevelObject = req.body;
    if (id && planetLevelObject && typeof(id) == 'string') {
        addPlanetLevelObjectToStellarObject(id, planetLevelObject as IPlanetLevelObjectInput, (success) => {
            if (success) {
                return res.status(200).json({
                    message: 'Successfully created new Planet Level Object.',
                    code: 'Success'
                })
            } else {
                return res.status(404).json({
                    message: 'Either the Stellar Object could not be found or there was an error within the given body. Please check both and try again.',
                    code: 'NotFound'
                });
            }
        })
    } else {
        return res.status(400).json({
            message: 'Please ensure, you have a Parameter called: "id" with the system id and a body holding a Stellar Object.',
            code: 'IncompleteBody'
        })
    }
}

function listSystems(req: Request, res: Response) {
    getAllSystemsSmall((success, result) => {
        if (success && result) {
            return res.status(200).json({
                message: 'Successfully fetched systems',
                code: 'Success',
                data: result
            });
        } else {
            return res.status(500).json({
                message: 'VISOR run into a problem fetching the necessary data. Please try again later.',
                code: 'InternalError'
            })
        }
    });
}

function dataGetSystem(req: Request, res: Response) {
    const { id } = req.query;
    if (id && typeof(id) == 'string') {
        getCompleteSystemFromID(id, (success, result) => {
            if (success && result) {
                return res.status(200).json({
                    message: 'Successfully fetched system.',
                    code: 'Success',
                    data: result
                });
            } else {
                return res.status(404).json({
                    message: 'The system-id specified could not be found. Please try another id.',
                    code: 'NotFound'
                });
            }
        });
    } else {
        return res.status(400).json({
            message: 'Please add the Param: "id" to this request to specify the system you want to fetch.',
            code: 'IncompleteBody'
        });
    }
}

function deleteSystem(req: Request, res: Response) {
    const { id } = req.body;
    if (id) {
        deleteCompleteSystem(id ,(success) => {
            if (success) {
                return res.status(200).json({
                    message: 'Successfully deleted System.',
                    code: 'Success'
                })
            } else {
                return res.status(404).json({
                    message: 'The id specified could not be found. Please try another id.',
                    code: 'NotFound'
                });
            }
        })
    } else {
        return res.status(400).json({
            message: 'Please add the Item: "id" to this request body.',
            code: 'IncompleteBody'
        });
    }
}

function deleteStellarObject(req: Request, res: Response) {
    const { stellarID, systemID } = req.body;
    if (systemID && stellarID) {
        deleteStellarObjectFromID(stellarID, systemID, (success) => {
            if (success) {
                return res.status(200).json({
                    message: 'Successfully deleted Planet Level Object.',
                    code: 'Success'
                })
            } else {
                return res.status(404).json({
                    message: 'Either the planetID or the stellarID specified could not be found. Please try another id.',
                    code: 'NotFound'
                });
            }
        })
    } else {
        return res.status(400).json({
            message: 'Please add the Item: "planetID" and "stellarID" to this request body.',
            code: 'IncompleteBody'
        });
    }
}

function deletePlanetLevelObject(req: Request, res: Response) {
    const { planetID, stellarID } = req.body;
    if (planetID && stellarID) {
        deletePlanetLevelObjectFromID(planetID, stellarID, (success) => {
            if (success) {
                return res.status(200).json({
                    message: 'Successfully deleted Planet Level Object.',
                    code: 'Success'
                })
            } else {
                return res.status(404).json({
                    message: 'Either the planetID or the stellarID specified could not be found. Please try another id.',
                    code: 'NotFound'
                });
            }
        })
    } else {
        return res.status(400).json({
            message: 'Please add the Item: "planetID" and "stellarID" to this request body.',
            code: 'IncompleteBody'
        });
    }
}

export default {
    dataCreateSystem,
    dataCreatePlanetLevelObject,
    dataCreateStellarObject,
    listSystems,
    dataGetSystem,
    deletePlanetLevelObject,
    deleteStellarObject,
    deleteSystem
}