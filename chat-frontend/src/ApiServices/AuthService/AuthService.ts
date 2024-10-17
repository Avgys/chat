import { Credentials, CredentialsModel } from "@/Models/Credentials";
import { ApiService } from "../ApiService";
import { Auth } from "@/env";

export class AuthService {
    private static TokenKey: string = 'token';
    private static TokenInfo: Token | null = null;
    private static lastTimer: NodeJS.Timeout | null = null;

    private static async GetNewAccessToken() {
        return await ApiService.GET<{ token: string }>(Auth.REFRESH_PATH);
    }

    public static async Login(credentials: Credentials): Promise<LoginResponse | null> {
        const responseSalt = await ApiService.GET<{ salt: string }>(Auth.SALT_PATH + '/?name=' + credentials.login);

        if (!responseSalt)
            return null;

        const passwordHash = this.HashPassword(credentials.password, responseSalt.salt);

        const payload: CredentialsModel = {
            Name: credentials.login,
            ClientPasswordHash: passwordHash,
            ClientSalt: responseSalt.salt
        };

        const response = await ApiService.POST<LoginResponse>(Auth.LOGIN_PATH, payload);

        if (response != null)
            this.SetToken(response.token);

        return response;
    }

    public static async Register(credentials: Credentials): Promise<RegisterResponse | null> {
        const responseSalt = await ApiService.GET<{ salt: string }>(Auth.SALT_PATH);

        if (!responseSalt)
            return null;

        const passwordHash = this.HashPassword(credentials.password, responseSalt.salt);

        const payload: CredentialsModel = {
            Name: credentials.login,
            ClientPasswordHash: passwordHash,
            ClientSalt: responseSalt.salt
        };
        return await ApiService.POST(Auth.REGISTER_PATH, payload);
    }

    static async IsAuth(): Promise<Token | null> {
        const token = await this.GetTokenInfo();
        return token;
    }

    static HashPassword(password: string, salt: string) {
        return password + salt;
    }

    static async GetTokenInfo(): Promise<Token | null> {

        if (!this.TokenInfo) {
            const token = await this.GetTokenAsync();

            if (token !== null)
                this.TokenInfo = this.DecodeToken(token);
        }

        return this.TokenInfo;
    }

    static StartAutoUpdate(token: Token) {
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
        if (this.TokenInfo != null && this.TokenInfo.exp < this.UnixSecondsNow()) {
            localStorage.removeItem(this.TokenKey);
            this.TokenInfo = null;
            return true;
        }

        return false;
    }

    static DecodeToken(encodedToken: string): Token | null {
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
            this.SetToken(response.token);
            this.TokenInfo = this.DecodeToken(response.token);
            if (this.TokenInfo === null)
                setTimeout(this.RefreshToken, 0);

            this.StartAutoUpdate(this.TokenInfo!);

            return response.token;
        }

        return null;
    }

    static async GetTokenAsync(): Promise<string | null> {
        let token = localStorage.getItem(this.TokenKey);

        if (!token || this.IsTokenExpired()) {
            token = (await this.RefreshToken());
        }

        return token;
    }

    static SetToken(token: string) {
        localStorage.setItem(this.TokenKey, token);
    }

    static async TryGetBearerHeader(url: string): Promise<{ header: string, value: string } | null> {
        if (IncludeBeareMatches.find(x => url.startsWith(x))) {
            const token = await this.GetTokenAsync();
            return { header: 'Authorization', value: `Bearer ${token}` };
        }

        return null;
    }

    static GetCookieMode(url: string): CredentialsMode {
        const pathExists = IncludeRefreshCookieMatch.some(x => url.startsWith(x));
        return pathExists ? 'include' : 'omit';
    }
}

export type AuthParams = {
    credMode: CredentialsMode,
    IsBearerNeaded: boolean;
}

export type CredentialsMode = 'omit' | 'include' | 'same-origin';

const IncludeRefreshCookieMatch = ['/api/auth/refreshToken', '/api/auth/login'];
const IncludeBeareMatches = ['/api/chats']