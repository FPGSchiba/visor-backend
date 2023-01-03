export interface IUser {
    token: string;
    handle: string;
    role: string;
}

export interface IPermission {
    name: string;
    roles: string[];
    access: IAccess; // Path which can be accessed
}

export interface IAccess {
    path: string,
    method: string
}