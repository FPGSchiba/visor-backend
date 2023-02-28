import * as dotenv from 'dotenv';
dotenv.config();

export const REPORT_TABLE_NAME = 'public-shared-reports';
export const ORG_CREATION_TABLE = 'private-org-creations'
export const MIGRATION_TABLE_NAME = 'migrations';
export const MIGRATION_DIRECTORY = './migration/';
export const DEFAULT_ORG_NAME = 'vanguard';
export const DEFAULT_ORG_REQUESTER = 'FPGSchiba';
export const TABLE_EXTENSION_USERS = '-users-table';
export const TABLE_EXTENSION_CHANGES = '-changes-table';
export const TABLE_EXTENSION_REPORTS = '-reports-table';
export const PERMISSIONS_TABLE_NAME = 'static-permissions';
export const SYSTEMS_TABLE_NAME = 'static-solar-systems';
export const STELLAR_OBJECTS_TABLE_NAME = 'static-stellar-objects';
export const PLANET_LEVEL_OBJECTS_TABLE_NAME = 'static-planet-level-objects';
export const PUBLIC_SUBFOLDER_NAME = 'public';
export const OM_SIMILARITY_THRESHOLD = typeof(process.env.OM_SIMILARITY_THRESHOLD) == 'undefined' ? 5 : +process.env.OM_SIMILARITY_THRESHOLD;