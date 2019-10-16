import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Chat } from "./chat.model";

@Injectable()
export class ChatService {
  constructor(private firestore: AngularFirestore) {}

  getAll(base: string) {
    return this.firestore.collection(base).snapshotChanges();
  }

  saveChat(chat: Chat) {
    return this.firestore.collection("chats").add(chat);
  }

  updateChat(chat: Chat) {
    let id = chat.id;
    delete chat.id;
    this.firestore.doc(`chats/${id}`).update(chat);
  }

  remove(chatId: string) {
    this.firestore.doc(`chats/${chatId}`).delete();
  }
}
