export type Contact = {
  UserId: number | null,
  ChatId: number | null,
  Name: string,
  AvatarSrc: string,
  LastMessage?: string,
  LastMessageUTC?: string,
  IsStranger: boolean
}

export function FixContactType(contact: Contact) {
    contact.AvatarSrc = 'face.jpeg'
    // if (contact.LastMessageUTC)
    //     contact.LastMessageUTC = new Date(contact.LastMessageUTC);
}   