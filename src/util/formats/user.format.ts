export interface IUser {
    token: string;
    handle: string;
    role: string;
}

export interface IPermission {
    name: string;
    roles: string[];
    access: string; // Path which can be accessed
}
