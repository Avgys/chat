'use client'

import { Contact } from "@/Models/Contact";
import { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Send } from "lucide-react"
import ContactList from './contact-list'

function ChatArea({ selectedContact }: { selectedContact: Contact | null }) {
  const [message, setMessage] = useState("");

  return (<>
    <div className="flex-1 flex flex-col bg-gray-900">
      {selectedContact ? (
        <>
          <div className="p-4 border-b border-gray-700 flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedContact.AvatarSrc} alt={selectedContact.Name} />
              <AvatarFallback>{selectedContact.Name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h2 className="ml-4 font-semibold text-gray-100">{selectedContact.Name}</h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            {/* Chat messages would go here */}
            <div className="text-center text-gray-400 my-4">
              This is the beginning of your conversation with {selectedContact.Name}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-gray-700">
            <form onSubmit={(e) => { e.preventDefault(); /* Handle message send */ }} className="flex items-center">
              <Input
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 mr-2 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
              />
              <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select a contact to start chatting
        </div>
      )}
    </div>
  </>);
}

export default ChatArea;