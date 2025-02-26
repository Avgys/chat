import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { Chat } from '@/models/Chat'
import { ContentMessage } from '@/models/Message'
import { ContactModel } from '@/models/Contact'

interface ChatsState {
    chats: Chat[],
    currentChatIndex?: number | undefined,

    currentCallChatIndex?: number | undefined,
    localMediaStream?: MediaStream | undefined,

    users: ContactModel[];
}

const initialState: ChatsState = {
    chats: [],
    users: []
}

const chatSlice = createSlice({
    name: 'chat',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<ContentMessage>) => {
            const message = action.payload;
            const chat = state.chats.find(x => x.contact.ChatId == message.Contact.ChatId);

            if (!chat?.messages)
                return;

            let sameIndex = -1;
            if (message.Id == null)
                message.Id = Math.max(...chat.messages.map(x => x.Id as number)) + 1;
            else
                sameIndex = chat.messages.findIndex(x => x.Id === message.Id);

            if (sameIndex === -1) {
                chat.messages.push(message);

                chat!.contact = {
                    ...chat!.contact,
                    LastMessage: message.Content,
                    LastMessageUTC: message.TimeStampUtc
                };
            }
            else{
                chat.messages[sameIndex] = message;
            }
        },
        addChats: (state, action: PayloadAction<Chat[]>) => {
            const newChats = action.payload.filter(x => findChatIndexByContact(state.chats, x.contact) === -1);
            if (newChats.length > 0)
                state.chats = [...state.chats, ...newChats];
        },
        updateOrAddChat: (state, action: PayloadAction<Chat>) => {
            const newChat = action.payload;
            newChat.messages?.sort((a, b) => a.Id! - b.Id!);
            const indx = findChatIndexByContact(state.chats, newChat.contact);

            if (indx != -1)
                state.chats[indx] = newChat;
            else
                state.chats.push(newChat);

        },
        selectChat: (state, action: PayloadAction<Chat>) => {
            const chat = action.payload;

            const indx = findChatIndexByContact(state.chats, chat.contact);
            state.currentChatIndex = indx;
        },
        selectCaller: (state, action: PayloadAction<Chat | null>) => {
            const chat = action.payload;

            if (!chat) {
                state.currentCallChatIndex = undefined;
                return;
            }

            const indx = findChatIndexByContact(state.chats, chat.contact);
            state.currentCallChatIndex = indx;
        },
    },
})

export function getCurrentChat(state: ChatsState) {
    return state.currentChatIndex !== undefined ? state.chats[state.currentChatIndex] : null;
}

export function getCurrentCallChat(state: ChatsState) {
    return state.currentCallChatIndex !== undefined ? state.chats[state.currentCallChatIndex] : null;
}

function findChatIndexByContact(chats: Chat[], contact: ContactModel) {
    return chats.findIndex(x => ContactModel.isEqual(contact, x.contact));
}

export function findChatById(state: ChatsState, chatId: number) {
    return state.chats.find(x => x.contact.ChatId && x.contact.ChatId === chatId);
}

export function findChatByContact(state: ChatsState, contact: ContactModel) {
    const index = findChatIndexByContact(state.chats, contact)
    return index != -1 ? state.chats[index] : null;
}

export const { addMessage, addChats, updateOrAddChat, selectChat, selectCaller } = chatSlice.actions

export const selectCount = (state: RootState) => state.chatState

export default chatSlice.reducer;