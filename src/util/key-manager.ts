import * as dotenv from 'dotenv';
import { decodeString, decryptUint8Array, encodeString, encryptUint8Array } from 'encrypt-uint8array/dist/source';
import * as crypto from 'crypto';
import { LOG } from './logger';
dotenv.config();

function getSHA1Hash(value: crypto.BinaryLike) {
    return crypto.createHash('sha1').update(value).digest('hex');
}

class UserKeyManager {
    // Generate here: https://onlinebase64tools.com/generate-random-base64 (Settings: min & max: 32, Avoid Padding: true, Chunk Lenght: 32)
    static readonly secret = process.env.USER_ENCRYPTION_SECRET || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
    static readonly algorithm = 'aes-256-ctr'
    static readonly iv = Buffer.from([0x2f, 0x76, 0xa0, 0xe6, 0x56, 0x10, 0x70, 0x4b, 0x98, 0x2b, 0xdc, 0xab, 0x04, 0x1d, 0x84, 0xcf]);

    private static encrypt(data: string): string {
        const cipher = crypto.createCipheriv(this.algorithm, this.secret, this.iv);
        return Buffer.concat([cipher.update(data), cipher.final()]).toString('hex');
    }

    static getUserKey(username: string): string {
        return this.encrypt(getSHA1Hash(username));
    }

    static validateUserKey(userKey: string, username: string): boolean {
        const userKeyFromName = this.getUserKey(username);
        return userKeyFromName == userKey;
    }
}

class OrgKeyManager {
    // Generate here: https://onlinebase64tools.com/generate-random-base64 (Settings: min & max: 32, Avoid Padding: true, Chunk Lenght: 32)
    static readonly secret = process.env.ORG_ENCRYPTION_SECRET || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
    static readonly algorithm = 'aes-256-ctr'
    static readonly iv = Buffer.from([0x2f, 0x76, 0xa0, 0xe6, 0x56, 0x10, 0x70, 0x4b, 0x98, 0x2b, 0xdc, 0xab, 0x04, 0x1d, 0x84, 0xcf]);

    private static encrypt(data: string): string {
        const cipher = crypto.createCipheriv(this.algorithm, this.secret, this.iv);
        return Buffer.concat([cipher.update(data), cipher.final()]).toString('hex');
    }

    static getOrgKey(orgName: string) {
        return this.encrypt(getSHA1Hash(orgName));
    }

    static validateOrgKey(orgKey: string, orgName: string): boolean {
        const userKeyFromName = this.getOrgKey(orgName);
        return userKeyFromName == orgKey;
    }
}

class OrgCreationKeyManager {
    // Generate here: https://onlinebase64tools.com/generate-random-base64 (Settings: min & max: 32, Avoid Padding: true, Chunk Lenght: 32)
    static readonly secret = process.env.CREATION_ENCRYPTION_SECRET || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
    static readonly algorithm = 'aes-256-ctr'
    static readonly iv = Buffer.from([0x2f, 0x76, 0xa0, 0xe6, 0x56, 0x10, 0x70, 0x4b, 0x98, 0x2b, 0xdc, 0xab, 0x04, 0x1d, 0x84, 0xcf]);

    private static encrypt(data: string): string {
        const cipher = crypto.createCipheriv(this.algorithm, this.secret, this.iv);
        return Buffer.concat([cipher.update(data), cipher.final()]).toString('hex');
    }

    static getCreationKey(orgName: string, requester: string) {
        return this.encrypt(getSHA1Hash(`${orgName}-${requester}`));
    }
}

export {
    OrgCreationKeyManager,
    OrgKeyManager,
    UserKeyManager,
}
