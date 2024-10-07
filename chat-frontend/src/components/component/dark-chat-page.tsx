'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Send } from "lucide-react"

type Contact = {
  id: number
  name: string
  avatar: string
  lastMessage: string
  time: string
}

const contacts: Contact[] = [
  { id: 1, name: "Alice Smith", avatar: "/placeholder.svg?height=32&width=32", lastMessage: "Hey, how are you?", time: "12:30 PM" },
  { id: 2, name: "Bob Johnson", avatar: "/placeholder.svg?height=32&width=32", lastMessage: "Can we meet tomorrow?", time: "11:45 AM" },
  { id: 3, name: "Carol Williams", avatar: "/placeholder.svg?height=32&width=32", lastMessage: "I've sent the files.", time: "Yesterday" },
  { id: 4, name: "David Brown", avatar: "/placeholder.svg?height=32&width=32", lastMessage: "Thanks for your help!", time: "Yesterday" },
  { id: 5, name: "Eva Davis", avatar: "/placeholder.svg?height=32&width=32", lastMessage: "See you at the conference.", time: "Monday" },
]

export function DarkChatPageComponent() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [message, setMessage] = useState("")

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Contacts List */}
      <div className="w-1/3 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search contacts"
              className="pl-10 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-73px)]">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-700 ${selectedContact?.id === contact.id ? 'bg-gray-700' : ''}`}
              onClick={() => setSelectedContact(contact)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-100">{contact.name}</h3>
                  <span className="text-xs text-gray-400">{contact.time}</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{contact.lastMessage}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-gray-700 flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                <AvatarFallback>{selectedContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <h2 className="ml-4 font-semibold text-gray-100">{selectedContact.name}</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
              {/* Chat messages would go here */}
              <div className="text-center text-gray-400 my-4">
                This is the beginning of your conversation with {selectedContact.name}
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
    </div>
  )
}