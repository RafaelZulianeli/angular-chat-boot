import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { AngularFirestore } from "@angular/fire/firestore";
import { Chat } from "./chat.model";

@Injectable()
export class ChatService {
  constructor(private firestore: AngularFirestore, private http: HttpClient) {}

  getAll(base: string) {
    return this.firestore.collection(base).snapshotChanges();
  }

  getVrByIdUser(id){
    return this.firestore.collection('vr', ref => ref.where('id_user', '==', id)).snapshotChanges()
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

  getAnswers(text) {
    const endPoint = "https://angular-chat-boot.azurewebsites.net/qnamaker/knowledgebases/72f7a1d9-3e07-4e64-8837-68eee002239f/generateAnswer";
    
    let httpOptions = {
      headers: new HttpHeaders({
        Authorization: 'EndpointKey 2363e3f2-bc22-4fee-b5a9-84fe27ccb497',
        ['Content-Type']: 'application/json'
      })
    }

    let payload = {
      question: text
    }

    return this.http.post(`${endPoint}`, payload, httpOptions);
  }
}
