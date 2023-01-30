import { IPlanetLevelObject, IStellarObject, ISystem } from "../formats/systems.format";
import {v4 as uuidv4} from 'uuid';
import { createTable, getAllTables } from "../database/database";
import { PLANET_LEVEL_OBJECTS_TABLE_NAME, STELLAR_OBJECTS_TABLE_NAME, SYSTEMS_TABLE_NAME } from "../config";
import { getSystemsTableFromName } from "../models/systems-model";
import { createPlanetLevelObjects, createStellarObjects, createSystems } from "../database/systems.database";
import { LOG } from "../logger";

// SECTION: Planet Level Objects
// Crusader
const cruL1ID = uuidv4();
const cruL2ID = uuidv4();
const cruL3ID = uuidv4();
const cruL4ID = uuidv4();
const cruL5ID = uuidv4();
const cellinID = uuidv4();
const daymarID = uuidv4();
const yelaID = uuidv4();

// ArcCorp
const arcL1ID = uuidv4();
const arcL2ID = uuidv4();
const arcL3ID = uuidv4();
const arcL4ID = uuidv4();
const arcL5ID = uuidv4();
const lyriaID = uuidv4();
const walaID = uuidv4();

// Hurston
const hurL1ID = uuidv4();
const hurL2ID = uuidv4();
const hurL3ID = uuidv4();
const hurL4ID = uuidv4();
const hurL5ID = uuidv4();
const arialID = uuidv4();
const aberdeenID = uuidv4();
const magdaID = uuidv4();
const itaID = uuidv4();

// MicroTec
const micL1ID = uuidv4();
const micL2ID = uuidv4();
const micL3ID = uuidv4();
const micL4ID = uuidv4();
const micL5ID = uuidv4();
const callipoeID = uuidv4();
const clioID = uuidv4();
const euterpeID = uuidv4();

const beginningPlanetLevelObjects = [
    {
        name: 'Cellin',
        type: 'moon',
        id: cellinID,
    },
    {
        name: 'Daymar',
        type: 'moon',
        id: daymarID
    },
    {
        name: 'Yela',
        type: 'moon',
        id: yelaID
    },
    {
        name: 'Lyria',
        type: 'moon',
        id: lyriaID
    },
    {
        name: 'Wala',
        type: 'moon',
        id: walaID
    },
    {
        name: 'Arial',
        type: 'moon',
        id: arialID
    },
    {
        name: 'Aberdeen',
        type: 'moon',
        id: aberdeenID
    },
    {
        name: 'Magda',
        type: 'moon',
        id: magdaID
    },
    {
        name: 'Ita',
        type: 'moon',
        id: itaID
    },
    {
        name: 'Calliope',
        type: 'moon',
        id: callipoeID
    },
    {
        name: 'Clio',
        type: 'moon',
        id: clioID
    },
    {
        name: 'Euterpe',
        type: 'moon',
        id: euterpeID
    }
] as IPlanetLevelObject[]

// SECTION: Stellar Objects
const crusaderID = uuidv4();
const arcCorpID = uuidv4();
const hurstonID = uuidv4();
const microTecID = uuidv4();
const aaronHalo = uuidv4();
const stantonPyroID = uuidv4();
const stantonMagnusID = uuidv4();
const stantonTerraID = uuidv4();

const beginningStellarObjects = [
    {
        name: 'Crusader',
        id: crusaderID,
        type: 'planet',
        planetLevelObjects: [
            cellinID,
            daymarID,
            yelaID
        ]
    },
    {
        name: 'ArcCorp',
        id: arcCorpID,
        type: 'planet',
        planetLevelObjects: [
            lyriaID,
            walaID
        ]
    },
    {
        name: 'Hurston',
        id: hurstonID,
        type: 'planet',
        planetLevelObjects: [
            arialID,
            aberdeenID,
            magdaID,
            itaID
        ]
    },
    {
        name: 'MicroTec',
        id: microTecID,
        type: 'planet',
        planetLevelObjects: [
            callipoeID,
            clioID,
            euterpeID
        ]
    },
    {
        name: 'Aaron Halo',
        id: aaronHalo,
        type: 'asteroidBelt',
    },
    {
        name: 'Stanton - Pyro',
        id: stantonPyroID,
        type: 'jumpPoint',
    },
    {
        name: 'Stanton - Magnus',
        id: stantonMagnusID,
        type: 'jumpPoint',
    },
    {
        name: 'Stanton - Terra',
        id: stantonTerraID,
        type: 'jumpPoint',
    }
] as IStellarObject[]

// SECTION: SYSTEMS
const stantonID = uuidv4();
const beginningSystems = [
    {
        name: 'Stanton',
        id: stantonID,
        stellarObjects: [
            crusaderID,
            arcCorpID,
            hurstonID,
            microTecID,
            aaronHalo,
            stantonMagnusID,
            stantonPyroID,
            stantonTerraID
        ]
    }
] as ISystem[]

export async function runMigration() {
    let finished = false;
    let success = false;
    createSystemsMigration((systemSuccess) => {
        if (systemSuccess) {
            createStellarObjectsMigration((stellarSuccess) => {
                if (stellarSuccess) {
                    createPlanetLevelObjectsMigration((planetSuccess) => {
                        if (planetSuccess) {
                            success = true;
                            finished = true;
                        } else {
                            LOG.error('Could not create Planet Level Objects!');
                            success = false;
                            finished = true;
                        }
                    })
                } else {
                    LOG.error('Could not create Stellar Objects!');
                    success = false;
                    finished = true;
                }
            })
        } else {
            LOG.error('Could not create Systems!');
            success = false;
            finished = true;
        }
    })

    while (!finished) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return success;
}

function createSystemsMigration(callback: (success: boolean) => void) {
    getAllTables((tables) => {
        if (!(tables && tables.includes(SYSTEMS_TABLE_NAME))) {
            const table = getSystemsTableFromName(SYSTEMS_TABLE_NAME);
            createTable(table, (tableSuccess) => {
                if (tableSuccess) {
                    createSystems(beginningSystems, (systemSuccess) => {
                        callback(systemSuccess);
                    })
                } else {
                    callback(tableSuccess);
                }
            });
        } else {
            LOG.warn('Systems Table does already exist. Skipping this Step.');
            callback(true);
        }
    });
}

function createStellarObjectsMigration(callback: (success: boolean) => void) {
    getAllTables((tables) => {
        if (!(tables && tables.includes(STELLAR_OBJECTS_TABLE_NAME))) {
            const table = getSystemsTableFromName(STELLAR_OBJECTS_TABLE_NAME);
            createTable(table, (tableSuccess) => {
                if (tableSuccess) {
                    createStellarObjects(beginningStellarObjects, (stellarSuccess) => {
                        callback(stellarSuccess);
                    })
                } else {
                    callback(tableSuccess);
                }
            });
        } else {
            LOG.warn('Systems Table does already exist. Skipping this Step.');
            callback(true);
        }
    });
}

function createPlanetLevelObjectsMigration(callback: (success: boolean) => void) {
    getAllTables((tables) => {
        if (!(tables && tables.includes(PLANET_LEVEL_OBJECTS_TABLE_NAME))) {
            const table = getSystemsTableFromName(PLANET_LEVEL_OBJECTS_TABLE_NAME);
            createTable(table, (tableSuccess) => {
                if (tableSuccess) {
                    createPlanetLevelObjects(beginningPlanetLevelObjects, (planetSuccess) => {
                        callback(planetSuccess);
                    })
                } else {
                    callback(tableSuccess);
                }
            });
        } else {
            LOG.warn('Systems Table does already exist. Skipping this Step.');
            callback(true);
        }
    });
}