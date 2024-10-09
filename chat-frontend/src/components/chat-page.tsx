// 'use client'

// import { useState } from 'react'
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Search, Send } from "lucide-react"
// import { Contact } from '@/Models/Contact'


// const contacts: Contact[] = [
// ]

// export function sdfsdChatPage() {
//   const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
//   const [message, setMessage] = useState("")

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Contacts List */}
//       <div className="w-1/3 bg-white border-r border-gray-200">
//         <div className="p-4 border-b border-gray-200">
//           <div className="relative">
//             <Input
//               type="text"
//               placeholder="Search contacts"
//               className="pl-10"
//             />
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//           </div>
//         </div>
//         <ScrollArea className="h-[calc(100vh-73px)]">
//           {contacts.map((contact) => (
//             <div
//               key={contact.id}
//               className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 ${selectedContact?.id === contact.id ? 'bg-blue-50' : ''}`}
//               onClick={() => setSelectedContact(contact)}
//             >
//               <Avatar className="h-12 w-12">
//                 <AvatarImage src={contact.avatar} alt={contact.name} />
//                 <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
//               </Avatar>
//               <div className="ml-4 flex-1">
//                 <div className="flex justify-between items-baseline">
//                   <h3 className="font-semibold">{contact.name}</h3>
//                   <span className="text-xs text-gray-500">{contact.time}</span>
//                 </div>
//                 <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
//               </div>
//             </div>
//           ))}
//         </ScrollArea>
//       </div>

//       {/* Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {selectedContact ? (
//           <>
//             <div className="p-4 border-b border-gray-200 flex items-center">
//               <Avatar className="h-10 w-10">
//                 <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
//                 <AvatarFallback>{selectedContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
//               </Avatar>
//               <h2 className="ml-4 font-semibold">{selectedContact.name}</h2>
//             </div>
//             <ScrollArea className="flex-1 p-4">
//               {/* Chat messages would go here */}
//               <div className="text-center text-gray-500 my-4">
//                 This is the beginning of your conversation with {selectedContact.name}
//               </div>
//             </ScrollArea>
//             <div className="p-4 border-t border-gray-200">
//               <form onSubmit={(e) => { e.preventDefault(); /* Handle message send */ }} className="flex items-center">
//                 <Input
//                   type="text"
//                   placeholder="Type a message"
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   className="flex-1 mr-2"
//                 />
//                 <Button type="submit" size="icon">
//                   <Send className="h-4 w-4" />
//                   <span className="sr-only">Send message</span>
//                 </Button>
//               </form>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center text-gray-500">
//             Select a contact to start chatting
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }