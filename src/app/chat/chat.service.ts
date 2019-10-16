import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Chat } from "./chat.model";

@Injectable()
export class ChatService {
  constructor(private firestore: AngularFirestore) {}

  getChats() {
    return this.firestore.collection("chats").snapshotChanges();
  }

  saveChat(chat: Chat) {
    return this.firestore.collection("chats").add(chat);
  }

  updateChat(chat: Chat) {
    delete chat.id;
    this.firestore.doc(`chats/${chat.id}`).update(chat);
  }

  remove(chatId: string) {
    this.firestore.doc(`chats/${chatId}`).delete();
  }
}
