import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Send } from "lucide-react"
import { Contact } from '@/Models/Contact'

type ContactListParams = {
    contacts: Contact[],
    selectedContact: Contact,
    onContactSelect: (contact: Contact) => void;
}

function ContactList({ contacts, onContactSelect, selectedContact }: ContactListParams) {

    const concactsContent = contacts.map((contact) => (
        <div
            key={contact.Id}
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-700 ${contact.Id === selectedContact?.Id ? 'bg-gray-700' : ''}`}
            onClick={() => onContactSelect(contact)}
        >
            <Avatar className="h-12 w-12">
                <AvatarImage src={contact.AvatarSrc} alt={contact.Name} />
                <AvatarFallback>{contact.Name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="ml-4 flex-1">
                <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-100">{contact.Name}</h3>
                    <span className="text-xs text-gray-400">{contact.Time}</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{contact.LastMessage}</p>
            </div>
        </div>
    ))

    return (
        <ScrollArea className="h-[calc(100vh-73px)]">
            {concactsContent}
        </ScrollArea>
    );
}


export default ContactList;