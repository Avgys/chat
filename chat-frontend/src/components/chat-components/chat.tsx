'use client'

import { useState } from 'react'
import { Contact } from '@/Models/Contact'
import ContactList from './contact-list'
import ChatArea from './chat-area';
import SearchInput from './search-input';
export function ChatPageComponent({contacts} : {contacts: Contact[]}) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  function onContactSelect(contact: Contact) {
    setSelectedContact(contact);
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <div className="w-1/3 bg-gray-800 border-r border-gray-700">
        <SearchInput />
        <ContactList contacts={contacts} onContactSelect={onContactSelect} selectedContact={selectedContact} />
      </div>
      <ChatArea selectedContact={selectedContact} />
    </div>
  )
}