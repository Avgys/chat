import { redirect } from 'next/navigation'

export default function Home() {
  
  redirect('/chats');
  return <div className="app">Pending...</div>
}