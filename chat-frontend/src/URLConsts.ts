export default abstract class URLConsts{
    //Auth
    public static AUTH_URL = 'https://localhost:44321';
    public static REGISTER_API = this.AUTH_URL + '/api/auth/register';
    public static SALT_PATH = this.AUTH_URL + '/api/auth/salt';     
    public static LOGIN_PATH = this.AUTH_URL + '/api/auth/login';
    public static REFRESH_PATH = this.AUTH_URL + '/api/auth/private/refresh';


    public static BACKEND_URL = 'https://localhost:44325';
    public static HUB_PATH = this.BACKEND_URL + '/hubs/chat'

    public static CHATS_PATH = this.BACKEND_URL + '/api/chats/'
}