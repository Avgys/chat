import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { Chat } from '@/Models/Chat'
import { ChatMessage } from '@/Models/Message'

interface ChatsState {
    chats: Chat[],
    currentChatIndex?: number | undefined
}

const initialState: ChatsState = {
    chats: [],
}

export const chatSlice = createSlice({
    name: 'chat',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<ChatMessage>) => {
            const messsage = action.payload;
            const chat = state.chats.find(x => x.contact.ChatId == messsage.ChatId);

            if (!chat?.messages)
                return;

            if (messsage.Id == null)
                messsage.Id = Math.max(...chat.messages.map(x => x.Id as number)) + 1;

            chat.messages.push(messsage);

            chat!.contact = {
                ...chat!.contact,
                LastMessage: messsage.Text,
                LastMessageUTC: messsage.TimeStampUtc
            };
        },
        addChats: (state, action: PayloadAction<Chat[]>) => {
            const newChats = action.payload.filter(x => findChatIndex(state.chats, x) === -1);
            if (newChats.length > 0)
                state.chats = [...state.chats, ...newChats];
        },
        updateOrAddChat: (state, action: PayloadAction<Chat>) => {
            const newChat = action.payload;
            newChat.messages?.sort((a, b) => a.Id! - b.Id!);
            const indx = findChatIndex(state.chats, newChat);

            if (indx != -1)
                state.chats[indx] = newChat;
            else
                state.chats.push(newChat);

        },
        selectChat: (state, action: PayloadAction<Chat>) => {
            const chat = action.payload;

            const indx = findChatIndex(state.chats, chat);
            state.currentChatIndex = indx;
        },
    },
})

export function selectCurrentChat(state: ChatsState) {
    return state.currentChatIndex !== undefined ? state.chats[state.currentChatIndex] : null;
}

function findChatIndex(chats: Chat[], chatToFind: Chat) {
    return chats.findIndex(x => x.contact.ChatId && x.contact.ChatId === chatToFind.contact.ChatId
        || x.contact.UserId && x.contact.UserId === chatToFind.contact.UserId);
}

export const { addMessage, addChats, updateOrAddChat, selectChat } = chatSlice.actions

export const selectCount = (state: RootState) => state.chatState

export default chatSlice.reducer;