export abstract class AUTH {
    static REGISTER_PATH = '/api/auth/register';
    static SALT_PATH = '/api/auth/salt';
    static LOGIN_PATH = '/api/auth/login';
    static REFRESH_PATH = '/api/auth/refreshToken/refresh';
}

export abstract class CHATS {
    static SEARCH_CONTACTS_PATH = '/api/chats/contacts';    
    static CHATS_PATH = '/api/chats';
    static CHAT_MESSAGES_PATH = '/api/chats/messages';
    static CHAT_PARTICIPANTS_PATH = '/api/chats/participants';
}

export abstract class CHAT_HUB {
    static HUB_PATH = '/api/hubs/chat';
    static SEND_CHAT_MESSAGE_METHOD = 'SendChatMessage';
    static SEND_DIRECT_MESSAGE_METHOD = 'SendDirectMessage';
    static START_PEER_CONNECTION_METHOD = 'StartPeerConnection';
}