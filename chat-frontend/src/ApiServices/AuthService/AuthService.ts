import { Credentials, CredentialsModel } from "@/types/Credentials";
import { ApiService } from "../ApiService";
import URLConsts from "@/URLConsts";
import { time } from "console";

export class AuthService {

    private static TokenKey: string = 'token';
    private static TokenInfo: Token | null = null;
    private static lastTimer: NodeJS.Timeout | null = null;

    static AuthHeader = new Headers({
        'Authorization': 'Bearer'
    });

    static GetFilledHeader() {
        const token = this.getToken();
        if (token == null)
            return null;

        const headers = new Headers(this.AuthHeader);
        headers.set('Authorization', 'Bearer ' + token)

        return headers;
    }

    public static async RefreshToken() {
        const response = await ApiService.GET(URLConsts.REFRESH_API);

        if (response != null) {
            this.setToken(response.token);
            this.TokenInfo = this.decodeToken(response.token);
            this.startAutoUpdate(this.TokenInfo!);
        }

        return response;
    }

    public static async Login(credentials: Credentials) {
        const responseSalt = await ApiService.GET(URLConsts.SALT_API + '/?name=' + credentials.login);

        const passwordHash = this.hashPassword(credentials.password, responseSalt.salt);
        const payload: CredentialsModel = {
            Name: credentials.login,
            ClientPasswordHash: passwordHash,
            ClientSalt: responseSalt.salt
        };

        const response: LoginResponse = await ApiService.POST(URLConsts.LOGIN_API, payload);

        if (response != null)
            this.setToken(response.token);

        return response;
    }

    public static async Register(credentials: Credentials): Promise<RegisterResponse> {
        const responseSalt = await ApiService.GET(URLConsts.SALT_API);
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

        this.checkTokenInfoExpiration();

        if (!this.TokenInfo) {
            const token = this.getToken();
            if (token != null) {
                this.TokenInfo = this.decodeToken(token!);
                this.checkTokenInfoExpiration();
            }

            if (!this.TokenInfo) {
                const response = await this.RefreshToken();

                if (!response)
                    return null;
            }
        }

        return this.TokenInfo!;
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

    static checkTokenInfoExpiration() {
        if (this.TokenInfo != null && this.TokenInfo.exp > this.UnixSecondsNow()) {
            localStorage.removeItem(this.TokenKey);
            this.TokenInfo = null;
        }
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

    static getToken() {
        return localStorage.getItem(this.TokenKey);
    }

    static setToken(token: string) {
        localStorage.setItem(this.TokenKey, token);
    }
}