export abstract class AUTH {
    static AUTH_PATH = '/api/auth';
    static REGISTER_PATH = AUTH.AUTH_PATH + '/register';
    static SALT_PATH = AUTH.AUTH_PATH + '/salt';
    static LOGIN_PATH = AUTH.AUTH_PATH + '/login';
    static REFRESH_PATH = AUTH.AUTH_PATH + '/refreshToken/refresh';
}

export abstract class CHATS {
    static SEARCH_CONTACTS_PATH = '/api/chats/contacts';
    static CHATS_PATH = '/api/chats';
    static CHAT_MESSAGES_PATH = '/api/chats/messages';
    static CHAT_PARTICIPANTS_PATH = '/api/chats/participants';
    static SEND_MESSAGE = '/api/send/message';
}

export abstract class CHAT_HUB {
    static HUB_PATH = '/api/hubs/chat';
    static SEND_MESSAGE_METHOD = 'SendMessage';
    static SEND_REQUEST_METHOD = 'SendRequest';
}