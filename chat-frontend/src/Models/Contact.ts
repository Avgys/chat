import { BlobOptions } from "buffer"

export class ContactModel {
  UserId?: number;
  ChatId?: number;
  Name?: string;
  AvatarSrc?: string;
  LastMessage?: string;
  LastMessageUTC?: string;
  IsStranger?: boolean;

  static isEqual(first: ContactModel, second: ContactModel): boolean {
    return !!((first.ChatId && second.ChatId && second.ChatId === first.ChatId)
      ?? (first.UserId && second.UserId && first.UserId === second.UserId));
  }
}

export function FixContactType(contact: ContactModel) {
  contact.AvatarSrc = 'face.jpeg'
  // if (contact.LastMessageUTC)
  //     contact.LastMessageUTC = new Date(contact.LastMessageUTC);
}   