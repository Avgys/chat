const cookieInclude = (() => {
    const includeRefreshCookieMatch = ['/api/auth/refreshToken', '/api/auth/login'];

    return async (url: string, request: RequestInit) => {
        const pathExists = includeRefreshCookieMatch.some(x => url.startsWith(x));
        request.credentials = pathExists ? 'include' : 'omit';
    }
})();

export { cookieInclude };

export type CredentialsMode = 'omit' | 'include' | 'same-origin';