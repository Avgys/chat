import { Credentials, CredentialsModel } from "@/Models/Credentials";
import { ApiService } from "../ApiService";
import URLConsts from "@/URLConsts";

export class AuthService {

    private static TokenKey: string = 'token';
    private static TokenInfo: Token | null = null;
    private static lastTimer: NodeJS.Timeout | null = null;

    static AuthHeader = { header: 'Authorization', bearer: '' };

    static getAuthHeader() {
        return this.AuthHeader;
    }

    private static async GetNewAccessToken() {
        return await ApiService.GET<{ token: string }>(URLConsts.REFRESH_PATH);
    }

    public static async Login(credentials: Credentials): Promise<LoginResponse | null> {
        const responseSalt = await ApiService.GET<{ salt: string }>(URLConsts.SALT_PATH + '/?name=' + credentials.login);

        if (!responseSalt)
            return null;

        const passwordHash = this.hashPassword(credentials.password, responseSalt.salt);
        const payload: CredentialsModel = {
            Name: credentials.login,
            ClientPasswordHash: passwordHash,
            ClientSalt: responseSalt.salt
        };

        const response = await ApiService.POST<LoginResponse>(URLConsts.LOGIN_PATH, payload);

        if (response != null)
            this.setToken(response.token);

        return response;
    }

    public static async Register(credentials: Credentials): Promise<RegisterResponse | null> {
        const responseSalt = await ApiService.GET<{ salt: string }>(URLConsts.SALT_PATH);

        if (!responseSalt)
            return null;

        const passwordHash = this.hashPassword(credentials.password, responseSalt.salt);

        const payload: CredentialsModel = {
            Name: credentials.login,
            ClientPasswordHash: passwordHash,
            ClientSalt: responseSalt.salt
        };
        return await ApiService.POST(URLConsts.REGISTER_API, payload);
    }

    static async isAuth() {
        const token = await this.getTokenInfo();
        return token;
    }

    static hashPassword(password: string, salt: string) {
        return password + salt;
    }

    static async getTokenInfo(): Promise<Token | null> {

        if (!this.TokenInfo || this.IsTokenExpired()) {
            const token = await this.RefreshToken();
            if (token !== null)
                this.TokenInfo = this.decodeToken(token);
        }

        return this.TokenInfo;
    }

    static startAutoUpdate(token: Token) {

        if (this.lastTimer) {
            clearTimeout(this.lastTimer);
            this.lastTimer = null;
        }

        const timeDelay = (token.exp * 1000 - Date.now());

        this.lastTimer = setTimeout(() => {
            clearTimeout(this.lastTimer!);
            this.lastTimer = null;

            this.RefreshToken();
        }, timeDelay);
    }

    static IsTokenExpired(): boolean {
        if (this.TokenInfo != null && this.TokenInfo.exp > this.UnixSecondsNow()) {
            localStorage.removeItem(this.TokenKey);
            this.TokenInfo = null;
            return true;
        }

        return false;
    }

    static decodeToken(encodedToken: string): Token | null {
        const userInfoPart = encodedToken.split('.')[1];
        let token;

        try {
            const userData = Buffer.from(userInfoPart, 'base64').toString('ascii');
            token = JSON.parse(userData);
        }
        catch (e) {
            token = null;
            console.log(e);
        }

        return token;
    }

    static UnixSecondsNow() { return Math.floor(Date.now() / 1000); }

    static async RefreshToken(): Promise<string | null> {
        const response = await this.GetNewAccessToken();

        if (response) {
            this.setToken(response.token);
            this.TokenInfo = this.decodeToken(response.token);
            //if (this.TokenInfo === null)
                //setTimeout(this.RefreshToken, 0);

            //this.startAutoUpdate(this.TokenInfo!);

            return response.token;
        }

        return null;
    }

    static async getTokenAsync(): Promise<string | null> {
        let token = localStorage.getItem(this.TokenKey);

        if (!token || !this.IsTokenExpired())
            token = (await this.RefreshToken());

        return token;
    }

    static setToken(token: string) {
        localStorage.setItem(this.TokenKey, token);
        this.AuthHeader.bearer = `Bearer ${token}`;
    }
}