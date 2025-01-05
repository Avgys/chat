export type ContactModel = {
  UserId?: number,
  ChatId?: number,
  Name?: string,
  AvatarSrc?: string,
  LastMessage?: string,
  LastMessageUTC?: string,
  IsStranger?: boolean
}

export function FixContactType(contact: ContactModel) {
    contact.AvatarSrc = 'face.jpeg'
    // if (contact.LastMessageUTC)
    //     contact.LastMessageUTC = new Date(contact.LastMessageUTC);
}   