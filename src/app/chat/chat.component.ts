import { Component, OnInit } from "@angular/core";
import { ChatService } from "./chat.service";
import { Chat } from "./chat.model";
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: "chat-list",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"]
})
export class ChatComponent implements OnInit {
  standalone = {standalone: true};

  chats: Chat[];
  faPaperPlane = faPaperPlane;
  initChat = false;

  users;
  vr;
  email;
  password;

  logged;
  oldChats;
  hoje;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.getAll("chats").subscribe(data => {
      this.chats = data.map(e => {

        let result = {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Chat;

        result.creationDate = new Date(result.creationDate.seconds * 1000);
        
        return result
      });
      console.log("chats: ",this.chats);

    });

    this.chatService.getAll("users").subscribe(data => {
      this.users = data.map(e => {

        let result = {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Chat;


        return result
      });
      console.log("users: ", this.users);
    });

    this.chatService.getAll("vr").subscribe(data => {
      this.vr = data.map(e => {

        let result = {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Chat;


        return result
      });
      console.log("vr: " ,this.vr);
    });
  }

  login() {
    // let user = this.users.filter(item => item.email == this.email)
    // if(!user.length || user[0].password != this.password){
    //   return alert('E-mail e/ou senha incorretos.');
    // }
    // console.log(user)

    // this.logged = user[0];
    // this.oldChats = this.chats.filter(item => item.user.id == user[0].id)[0];

    this.hoje = Date.now()
    this.logged = this.users[1];
    this.oldChats = this.chats[0];

    this.initChat = !this.initChat;
  }

  close() {
    this.email = '';
    this.password = '';
    this.logged = null;
    this.initChat = !this.initChat;
  }

  create(chat: Chat) {
    this.chatService.saveChat(chat);
  }

  update(chat: Chat) {
    this.chatService.updateChat(chat);
  }

  delete(id: string) {
    this.chatService.remove(id);
  }
}
