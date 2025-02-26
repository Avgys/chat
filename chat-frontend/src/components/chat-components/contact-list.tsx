'use client'

import { ChatService } from "@/ApiServices/ChatService/ChatService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chat } from "@/models/Chat";
import { FormatStringDate } from "@/models/FormatStringDate";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addChats, selectChat, getCurrentChat, updateOrAddChat } from "@/store/slice";
import { useMemo, useState } from "react";
import SearchInput from "../ui/search-input";
import { useService } from "@/customHooks/useService";

function ContactList() {
    const [contactsFilter, setContactsFilter] = useState<string>('');
    const [usedSearches, setUsedSearches] = useState<string[]>(['']);

    const unFilteredChats = useAppSelector(x => x.chatState.chats);
    const selectedChat = useAppSelector(x => getCurrentChat(x.chatState));

    const chatService = useService(ChatService);

    const dispatch = useAppDispatch();

    function isEmptyOrSpaces(str: string) {
        return str === null || str.match(/^ *$/) !== null;
    }

    async function onChatSelect(chat: Chat) {
        if (!chat.isLoaded && chat.contact.ChatId) {
            chat = await chatService.LoadChat(chat.contact.ChatId);
            dispatch(updateOrAddChat(chat))
        }

        dispatch(selectChat(chat));
    };

    function searchUsers(nameFilter: string) {
        let newFilter = isEmptyOrSpaces(nameFilter) ? '' : nameFilter;

        if (newFilter == contactsFilter)
            return;

        setContactsFilter(newFilter);

        if (usedSearches.includes(newFilter))
            return;

        setUsedSearches([...usedSearches, newFilter]);

        chatService.loadContacts(newFilter).then((contacts) => {
            const newChats: Chat[] = contacts.map(x => { return { contact: x, messages: null, participants: null, isLoaded: false } });
            dispatch(addChats(newChats))
        })
    }

    const contactsToShow = useMemo(() => {
        const chats = unFilteredChats.filter(x => isEmptyOrSpaces(contactsFilter)
            ? !x.contact.IsStranger
            : x.contact.Name?.includes(contactsFilter));

        const friends = chats
            .filter(x => !x.contact.IsStranger)
            .sort((a, b) =>
                (a.contact.LastMessageUTC && b.contact.LastMessageUTC)
                    ? (new Date(a.contact.LastMessageUTC).getMilliseconds()! - new Date(b.contact.LastMessageUTC).getMilliseconds()!)
                    : (a.contact.Name!.localeCompare(b.contact.Name!)))
            .map(x => <Contact key={x?.contact.ChatId ?? -x.contact.UserId!} chat={x} isSelected={x == selectedChat} onSelect={onChatSelect} />)

        const strangers = chats
            .filter(x => x.contact.IsStranger)
            .sort((a, b) => a.contact.Name!.localeCompare(b.contact.Name!))
            .map(x => <Contact key={x?.contact.ChatId ?? -x.contact.UserId!} chat={x} isSelected={x == selectedChat} onSelect={onChatSelect} />);

        return (<>
            {friends}
            {strangers.length > 0 && <><hr />{strangers}</>}
        </>)
    }, [unFilteredChats, contactsFilter]);

    return (
        <div className="min-w-32 max-w-72 bg-gray-800 border-r border-gray-700">
            <SearchInput onInput={searchUsers} />
            <ScrollArea className="h-[calc(100vh-73px)]">
                {contactsToShow}
            </ScrollArea >
        </div>
    );
}

function Contact({ chat, isSelected, onSelect }: { chat: Chat, isSelected: boolean, onSelect: (chat: Chat) => void }) {
    return <div
        className={`flex items-center p-4 cursor-pointer hover:bg-gray-700 ${isSelected ? 'bg-gray-700' : ''}`}
        onClick={() => onSelect(chat)}>
        <Avatar className="h-12 w-12">
            <AvatarImage src={chat.contact.AvatarSrc} alt={chat.contact.Name} />
            <AvatarFallback>{chat.contact.Name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="ml-4 flex-1">
            <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-gray-100">{chat.contact.Name}</h3>
                <span className="text-xs text-gray-400">{FormatStringDate(chat.contact.LastMessageUTC, { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="text-sm text-gray-400 truncate">{chat.contact.LastMessage}</p>
        </div>
    </div>
}

export default ContactList;