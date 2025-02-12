import { Credentials, CredentialsModel } from "@/models/Credentials";
import { ApiService } from "../ApiService";
import { AUTH, CHATS } from "@/apiPaths";
import { inject, injectable } from "inversify";
import { Token } from "./Models/TokenModel";

@injectable()
export class AuthService {
    private readonly TokenKey: string = 'token';
    public updateCallbacks: ((token: Token | null) => void)[] = [];

    private token: Token | null = null;
    private lastTimer: NodeJS.Timeout | null = null;

    constructor(@inject(ApiService) private apiService: ApiService) {
        this.apiService.middlewares.push(this.bearerMiddleware.bind(this));
    }

    async bearerMiddleware(url: string, request: RequestInit) {
        function isBearerIncluded(url: string) {
            const includeBeareMatches = [CHATS.CHATS_PATH, CHATS.SEND_MESSAGE];
            return includeBeareMatches.find(x => url.startsWith(x));
        }

        if (!isBearerIncluded(url))
            return;

        const token = await this.getTokenAsync();

        const headers = new Headers(request.headers);
        headers.append('Authorization', `Bearer ${token!.source}`);

        request.headers = headers;
    }

    private GetNewAccessToken() {
        return this.apiService.GET<{ token: string }>(AUTH.REFRESH_PATH);
    }

    public async Login(credentials: Credentials): Promise<LoginResponse | null> {
        const responseSalt = await this.apiService.GET<{ salt: string }>(AUTH.SALT_PATH + '/?name=' + credentials.login);

        if (!responseSalt)
            return null;

        const passwordHash = this.HashPassword(credentials.password, responseSalt.salt);

        const payload: CredentialsModel = {
            Name: credentials.login,
            ClientPasswordHash: passwordHash,
            ClientSalt: responseSalt.salt
        };

        const response = await this.apiService.POST<LoginResponse>(AUTH.LOGIN_PATH, payload);

        if (response != null)
            this.setToken(response.token);

        return response;
    }

    public async Register(credentials: Credentials): Promise<RegisterResponse | null> {
        const responseSalt = await this.apiService.GET<{ salt: string }>(AUTH.SALT_PATH);

        if (!responseSalt)
            return null;

        const passwordHash = this.HashPassword(credentials.password, responseSalt.salt);

        const payload: CredentialsModel = {
            Name: credentials.login,
            ClientPasswordHash: passwordHash,
            ClientSalt: responseSalt.salt
        };

        return await this.apiService.POST(AUTH.REGISTER_PATH, payload);
    }

    async IsAuth(): Promise<Token | null> {
        return await this.getTokenAsync();
    }

    HashPassword(password: string, salt: string) {
        return password + salt;
    }

    StartAutoUpdate(token: Token) {
        if (this.lastTimer) {
            clearTimeout(this.lastTimer);
            this.lastTimer = null;
        }

        const timeDelay = (token.exp * 1000 - Date.now());

        this.lastTimer = setTimeout(() => {
            clearTimeout(this.lastTimer!);
            this.lastTimer = null;

            this.refreshToken();
        }, timeDelay);
    }

    async refreshToken(): Promise<Token | null> {
        const response = await this.GetNewAccessToken();

        if (response) {
            const token = this.setToken(response.token);

            if (token === null)
                setTimeout(this.refreshToken, 0);
            else
                this.StartAutoUpdate(token);

            return token;
        }

        return null;
    }

    async getTokenAsync(): Promise<Token | null> {
        const token = localStorage.getItem(this.TokenKey);

        if (!token || this.token?.isExpired()) {
            await this.refreshToken();
        }

        return this.token;
    }

    setToken(tokenString: string) {
        localStorage.setItem(this.TokenKey, tokenString);

        try {
            this.token = new Token(tokenString);
        }
        catch (e) {
            console.log(e);
            this.token = null;
        }

        this.invokeTokenUpdate(this.token);

        return this.token;
    }

    invokeTokenUpdate(token: Token | null) {
        this.updateCallbacks.forEach(element => element.call(null, token));
    }
}