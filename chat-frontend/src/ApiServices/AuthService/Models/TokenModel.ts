import { UnixSecondsNow } from "@/lib/utils/UnixSeconds";

export class Token {
    public source: string;

    public UserId: string;
    public Role: string;
    public UserName: string;
    exp: number;
    iss: string;
    aud: string;

    constructor(source: string) {
        const token = this.decodeToken(source);

        this.source = source;
        this.UserId = token.UserId;
        this.Role = token.Role;
        this.UserName = token.UserName;
        this.exp = token.exp;
        this.iss = token.iss;
        this.aud = token.aud;
    }

    decodeToken(encodedToken: string): Token {
        const userInfoPart = encodedToken.split('.')[1];

        const userData = Buffer.from(userInfoPart, 'base64').toString('ascii');
        const token = JSON.parse(userData);

        return token;
    }

    isExpired() {
        return this.exp < UnixSecondsNow()
    }
}