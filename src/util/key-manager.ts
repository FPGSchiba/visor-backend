import * as dotenv from 'dotenv';
import { decodeString, decryptUint8Array, encodeString, encryptUint8Array } from 'encrypt-uint8array/dist/source';
import { LOG } from './logger';
dotenv.config();

class UserKeyManager {
    readonly secret = encodeString(process.env.USER_ENCRYPTION_SECRET || 'th1s1ss3cur3');

    public async createUserKey(username: string): Promise<string> {
        return Buffer.from(await encryptUint8Array(encodeString(username), this.secret)).toString('hex');
    }

    public async validateUserKey(userKey: string, username: string): Promise<boolean> {
        const usernameFromKey = await decodeString(await decryptUint8Array(encodeString(userKey), this.secret));
        return username == usernameFromKey;
    }

    public getUserFromKey(userKey: string): string {
        return '';
    }

    public getKeyFromUser(username: string): string {
        return '';
    }
}

class OrgKeyManager {
    readonly secret = encodeString(process.env.ORG_ENCRYPTION_SECRET || 'th1s1ss3cur3');

    createOrgKey(orgName: string) {

    }

    validateOrgKey(orgKey: string, orgName: string): boolean {
        return true;
    }

    getOrgFromKey(orgKey: string): string {
        return '';
    }

    getKeyFromOrg(orgName: string): string {
        return '';
    }
}

class OrgCreationKeyManager {
    readonly secret = encodeString(process.env.CREATION_ENCRYPTION_SECRET || 'th1s1ss3cur3');

    createCreationKey(orgName: string, requester: string) {

    }

    activateCreationKey(orgKey: string): boolean {
        return true;
    }
}

export {
    OrgCreationKeyManager,
    OrgKeyManager,
    UserKeyManager,
}
