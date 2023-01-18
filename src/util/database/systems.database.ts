import { PLANET_LEVEL_OBJECTS_TABLE_NAME, STELLAR_OBJECTS_TABLE_NAME, SYSTEMS_TABLE_NAME } from "../config";
import { ICompleteStellarObject, ICompleteSystem, IPlanetLevelObject, IPlanetLevelObjectInput, IStellarObject, IStellarObjectInput, ISystem, ISystemInput, ISystemSmall } from "../formats/systems.format";
import { LOG } from "../logger";
import { deleteItem, getItemFromTable, putItem, scanTable, updateItem } from "./database";
import {v4 as uuidv4} from 'uuid';
import { DynamoDB } from "aws-sdk";

export async function createCompleteSystem(system: ISystemInput, callback: (success: boolean) => void) {
    const systemID = uuidv4();
    const stellarObjects = await Promise.all(system.stellarObjects.map(async (stellarObject) => {
        if (stellarObject.planetLevelObjects) {
            const stellarID = uuidv4();
            let doneStellarCreation = false;
            const planetLevelObjects = await Promise.all(stellarObject.planetLevelObjects.map(async (planetLevelObject) => {
                // Generate ID
                const objectID = uuidv4();
                let doneCreation = false;
                // Create Object
                createPlanetLevelObject({ ...planetLevelObject, id: objectID }, (success) => {
                    if (!success) {
                        callback(false);
                    }
                    doneCreation = true;
                });
                while (!doneCreation) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                // Return ID
                return objectID;
            }))
            createStellarObject({...stellarObject, id: stellarID, planetLevelObjects: planetLevelObjects}, (success) => {
                if (!success) {
                    callback(false);
                }
                doneStellarCreation = true;
            });
            while (!doneStellarCreation) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            // Return ID
            return stellarID;
        } else {
            // Generate ID
            const stellarID = uuidv4();
            let doneStellarCreation = false;
            // Create Object
            createStellarObject({...stellarObject, id: stellarID, planetLevelObjects: undefined}, (success) => {
                if (!success) {
                    callback(false);
                }
                doneStellarCreation = true;
            });
            while (!doneStellarCreation) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            // Return ID
            return stellarID;
        }
    }));
    createSystem({...system, id: systemID, stellarObjects}, (success) => {
        callback(success);
    })
}

export function createSystems(systems: ISystem[], callback: (success: boolean) => void) {
    systems.map((value) => {
        const item = {
            id: {S: value.id},
            name: {S: value.name},
            stellarObjects: {SS: value.stellarObjects}
        }
        putItem(SYSTEMS_TABLE_NAME, item, (err) => {
            if (err) {
                LOG.error(err.message);
                callback(false);
            }
        })
    });
    callback(true);
}

export function createSystem(system: ISystem, callback: (success: boolean) => void) {
    const item = {
        id: {S: system.id},
        name: {S: system.name},
        stellarObjects: {SS: system.stellarObjects}
    }
    putItem(SYSTEMS_TABLE_NAME, item, (err) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true);
        }
    })
}

export function createStellarObjects(stellarObjects: IStellarObject[], callback: (success: boolean) => void) {
    stellarObjects.map((value) => {
        const item = {
            id: {S: value.id},
            name: {S: value.name},
            type: {S: value.type},
        }
        if (value.planetLevelObjects) {
            const finalItem = {
                ...item,
                planetLevelObjects: {SS: value.planetLevelObjects}
            }
            putItem(STELLAR_OBJECTS_TABLE_NAME, finalItem, (err) => {
                if (err) {
                    LOG.error(err.message);
                    callback(false);
                }
            })
        } else {
            putItem(STELLAR_OBJECTS_TABLE_NAME, item, (err) => {
                if (err) {
                    LOG.error(err.message);
                    callback(false);
                }
            })
        }
    });
    callback(true);
}

export function createStellarObject(stellarObject: IStellarObject, callback: (success: boolean) => void) {
    const item = {
        name: {S: stellarObject.name},
        id: {S: stellarObject.id},
        type: {S: stellarObject.type},
    }
    if (stellarObject.planetLevelObjects) {
        const finalItem = {
            ...item,
            planetLevelObjects: {SS: stellarObject.planetLevelObjects}
        }
        putItem(STELLAR_OBJECTS_TABLE_NAME, finalItem, (err) => {
            if (err) {
                LOG.error(err.message);
                callback(false);
            } else {
                callback(true);
            }
        })
    } else {
        putItem(STELLAR_OBJECTS_TABLE_NAME, item, (err) => {
            if (err) {
                LOG.error(err.message);
                callback(false);
            } else {
                callback(true);
            }
        })
    }
}

export function createPlanetLevelObjects(lowLevelObjects: IPlanetLevelObject[], callback: (success: boolean) => void) {
    lowLevelObjects.map((value) => {
        const item = {
            id: {S: value.id},
            name: {S: value.name},
            type: {S: value.type}
        }
        putItem(PLANET_LEVEL_OBJECTS_TABLE_NAME, item, (err) => {
            if (err) {
                LOG.error(err.message);
                callback(false);
            }
        })
    });
    callback(true);
}

export function createPlanetLevelObject(planetLevelObject: IPlanetLevelObject, callback: (success: boolean) => void) {
    const item = {
        id: {S: planetLevelObject.id},
        name: {S: planetLevelObject.name},
        type: {S: planetLevelObject.type}
    }
    putItem(PLANET_LEVEL_OBJECTS_TABLE_NAME, item, (err) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true);
        }
    })
}

export function getCompleteSystemFromID(systemID: string, callback: (success: boolean, result?: ICompleteSystem) => void) {
    getSystemFromID(systemID, async (success, systemResult) => {
        if (success && systemResult) {
            const completeStellarObjects: ICompleteStellarObject[] = [];
            let doneCounter = 0;
            systemResult.stellarObjects.map((value) => {
                getCompleteStellarObjectFromID(value, (success, stellarResult) => {
                    if (success && stellarResult) {
                        completeStellarObjects.push(stellarResult);
                    }
                    doneCounter++;
                });
            });
            // Wait on fetch to finish
            while (doneCounter < systemResult.stellarObjects.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const result: ICompleteSystem = {
                name: systemResult.name,
                id: systemResult.id,
                stellarObjects: completeStellarObjects
            }
            callback(true, result);
        } else {
            callback(false);
        }
    })
} 

export function getSystemFromID(systemID: string, callback: (success: boolean, result?: ISystem) => void) {
    const key = {
        id: {S: systemID}
    }
    getItemFromTable(SYSTEMS_TABLE_NAME, key, (success, data) => {
        if (success && data?.Item) {
            const result: ISystem = {
                id: data.Item.id.S || '',
                name: data.Item.name.S || '',
                stellarObjects: data.Item.stellarObjects.SS || [],
            }
            callback(true, result);
        } else {
            callback(false);
        }
    })
}

export function getCompleteStellarObjectFromID(stellarID: string, callback: (success: boolean, result?: ICompleteStellarObject) => void) {
    const key = {
        id: {S: stellarID}
    }
    getItemFromTable(STELLAR_OBJECTS_TABLE_NAME, key, async (success, data) => {
        if (success && data?.Item) {
            const stellarResult: IStellarObject = {
                id: data.Item.id.S || '',
                name: data.Item.name.S || '',
                type: data.Item.type.S || '',
                planetLevelObjects: data.Item.planetLevelObjects ? data.Item.planetLevelObjects.SS : undefined
            }
            if (typeof(stellarResult.planetLevelObjects) == 'undefined' && !stellarResult.planetLevelObjects) {
                callback(true, stellarResult as ICompleteStellarObject);
            } else {
                const planetLevelObjects: IPlanetLevelObject[] = [];
                let doneCounter = 0;
                stellarResult.planetLevelObjects.map((value) => {
                    getPlanetLevelObjectFromID(value, (success, planetResult) => {
                        if (success && planetResult) {
                            planetLevelObjects.push(planetResult);
                        }
                        doneCounter++;
                    });
                });

                // Wait on fetch to finish
                while (doneCounter < stellarResult.planetLevelObjects.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                const result: ICompleteStellarObject = {
                    name: stellarResult.name,
                    id: stellarResult.id,
                    type: stellarResult.type,
                    planetLevelObjects: planetLevelObjects
                }
                callback(true, result);
            }   
        } else {
            callback(false);
        }
    })
}

export function getStellarObjectFromID(stellarID: string, callback: (success: boolean, result?: IStellarObject) => void) {
    const key = {
        id: {S: stellarID}
    }
    getItemFromTable(STELLAR_OBJECTS_TABLE_NAME, key, (success, data) => {
        if (success) {
            if (data?.Item) {
                const result: IStellarObject = {
                    id: data.Item.id.S || '',
                    name: data.Item.name.S || '',
                    type: data.Item.type.S || '',
                    planetLevelObjects: data.Item.planetLevelObjects ? data.Item.planetLevelObjects.SS : undefined
                }
                callback(true, result);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
}

export function getPlanetLevelObjectFromID(planetLevelID: string, callback: (success: boolean, result?: IPlanetLevelObject) => void) {
    const key = {
        id: {S: planetLevelID}
    }
    getItemFromTable(PLANET_LEVEL_OBJECTS_TABLE_NAME, key, (success, data) => {
        if (success) {
            if (data?.Item) {
                const result: IPlanetLevelObject = {
                    id: data.Item.id.S || '',
                    name: data.Item.name.S || '',
                    type: data.Item.type.S || '',
                }
                callback(true, result);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
}

export function getAllSystemsSmall(callback: (success: boolean, result?: ISystemSmall[]) => void) {
    scanTable(SYSTEMS_TABLE_NAME, (data) => {
        if (data.Items && data.Count && data.Count > 0) {
            const result = data.Items.map((value) => {
                return {
                    id: value.id.S,
                    name: value.name.S,
                } as ISystemSmall
            });
            callback(true, result);
        } else {
            callback(false);
        }
    })
}

export function addStellarObjectToSystem(systemID: string, stellarObject: IStellarObjectInput, callback: (success: boolean) => void) {
    // Generate new ID
    const stellarID = uuidv4();
    // Update system with new ID
    const key = {
        id: {S: systemID}
    }
    const updates: DynamoDB.AttributeUpdates = {
        stellarObjects: {
            Value: {SS: [stellarID]},
            Action: "ADD"
        }
    }
    updateItem(SYSTEMS_TABLE_NAME, key, updates, (updateSuccess) => {
        if (updateSuccess) {
            // Check for planet level
            if (stellarObject.planetLevelObjects && stellarObject.planetLevelObjects.length > 0) {
                // Create planet level
                const planetLevelObjects = stellarObject.planetLevelObjects.map((value) => {
                    const id = uuidv4();
                    const planetLevel = {
                        ...value,
                        id,
                    }
                    createPlanetLevelObject(planetLevel, (success) => {
                        if (!success) {
                            callback(false);
                        }
                    });
                    return id;
                });
                // Create Object
                createStellarObject({...stellarObject, id: stellarID, planetLevelObjects}, (creationSuccess) => {
                    callback(creationSuccess);
                })
            } else {
                // Create Object
                createStellarObject({...stellarObject, id: stellarID, planetLevelObjects: undefined}, (creationSuccess) => {
                    callback(creationSuccess);
                })
            }
        } else {
            callback(false);
        }
    })
}

export function addPlanetLevelObjectToStellarObject(stellarObjectID: string, planetLevel: IPlanetLevelObjectInput, callback: (success: boolean) => void) {
    // Generate new ID
    const planetLevelID = uuidv4();
    // Update stellar Object with new ID
    const key = {
        id: {S: stellarObjectID}
    }
    const updates: DynamoDB.AttributeUpdates = {
        planetLevelObjects: {
            Value: {SS: [planetLevelID]},
            Action: "ADD"
        }
    }
    updateItem(STELLAR_OBJECTS_TABLE_NAME, key, updates, (updateSuccess) => {
        if (updateSuccess) {
            // Create Object
            createPlanetLevelObject({...planetLevel, id: planetLevelID}, (creationSuccess) => {
                callback(creationSuccess);
            })
        } else {
            callback(false);
        }
    })
}

export function deleteCompleteSystem(systemID: string, callback: (success: boolean) => void) {
    getSystemFromID(systemID, async (success, result) => {
        if (result && success) {
            let doneCounter = 0;
            result.stellarObjects.map((value) => {
                deleteStellarObjectFromID(value, systemID,(success) => {
                    if (!success) {
                        callback(false);
                    }
                    doneCounter++;
                });
            });
            
            while (doneCounter < result.stellarObjects.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const key = {
                id: {S: systemID}
            }

            deleteItem(SYSTEMS_TABLE_NAME, key, (success) => {
                callback(success);
            })
            
        } else {
            callback(false);
        }
    });
}

// With functionality to clean up System array
export function deleteStellarObjectFromID(stellarObjectID: string, systemID: string, callback: (success: boolean) => void) {
    // Get all PlanetLevel
    getStellarObjectFromID(stellarObjectID, async (success, result) => {
        if (result && success) {
            if (result.planetLevelObjects && result.planetLevelObjects.length > 0) {
                let doneCounter = 0;
                result.planetLevelObjects.map((value) => {
                    const key = {
                        id: {S: value}
                    }
                    deleteItem(PLANET_LEVEL_OBJECTS_TABLE_NAME, key, (success) => {
                        if (!success) {
                            callback(false);
                        }
                        doneCounter++;
                    });
                });

                while (doneCounter < result.planetLevelObjects.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                const key = {
                    id: {S: stellarObjectID}
                }

                deleteItem(STELLAR_OBJECTS_TABLE_NAME, key, (success) => {
                    if (success) {
                        const key = {
                            id: {S: systemID}
                        }
                        const updates: DynamoDB.AttributeUpdates = {
                            planetLevelObjects: {
                                Value: {SS: [stellarObjectID]},
                                Action: "DELETE"
                            }
                        }
                        updateItem(SYSTEMS_TABLE_NAME, key, updates, (success) => {
                            callback(success);
                        })
                    } else {
                        callback(false);
                    }
                });

            } else {
                const key = {
                    id: {S: stellarObjectID}
                }
                deleteItem(STELLAR_OBJECTS_TABLE_NAME, key, (success) => {
                    if (success) {
                        const key = {
                            id: {S: systemID}
                        }
                        const updates: DynamoDB.AttributeUpdates = {
                            planetLevelObjects: {
                                Value: {SS: [stellarObjectID]},
                                Action: "DELETE"
                            }
                        }
                        updateItem(SYSTEMS_TABLE_NAME, key, updates, (success) => {
                            callback(success);
                        })
                    } else {
                        callback(false);
                    }
                });
            }
        } else {
            callback(false)
        }
    })
}

// With functionality to clean up Stellar Object array
export function deletePlanetLevelObjectFromID(planetLevelID: string, stellarID: string, callback: (success: boolean) => void) {
    const key = {
        id: {S: planetLevelID}
    }
    deleteItem(PLANET_LEVEL_OBJECTS_TABLE_NAME, key, (success) => {
        if (success) {
            const key = {
                id: {S: stellarID}
            }
            const updates: DynamoDB.AttributeUpdates = {
                planetLevelObjects: {
                    Value: {SS: [planetLevelID]},
                    Action: "DELETE"
                }
            }
            updateItem(STELLAR_OBJECTS_TABLE_NAME, key, updates, (success) => {
                callback(success);
            })
        } else {
            callback(false);
        }
    })
}