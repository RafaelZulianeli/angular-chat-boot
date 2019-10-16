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

  public chats: Chat[];
  public faPaperPlane = faPaperPlane;

  public user: any;
  public initChat = false;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.getChats().subscribe(data => {
      this.chats = data.map(e => {

        let result = {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Chat;

        console.log(result);

        result.creationDate = new Date(result.creationDate.seconds * 1000);
        
        return result
      });
    });
  }

  login() {
    this.initChat = true;
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
