export default abstract class URLConsts{
    public static AUTH_URL = 'https://localhost:44321';
    public static BACKEND_URL = 'https://localhost:44325';

    public static REGISTER_API = this.AUTH_URL + '/api/auth/register';
    public static SALT_API = this.AUTH_URL + '/api/auth/salt';     
    public static LOGIN_API = this.AUTH_URL + '/api/auth/login';
    public static REFRESH_API = this.AUTH_URL + '/api/auth/private/refresh';
}