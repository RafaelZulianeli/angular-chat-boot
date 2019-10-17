import { Component, OnInit } from "@angular/core";
import { ChatService } from "./chat.service";
import { Chat } from "./chat.model";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "chat-list",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"]
})
export class ChatComponent implements OnInit {
  standalone = { standalone: true };

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

  saldoVR;

  message;
  conversaAtual = [];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.getAll("chats").subscribe(data => {
      this.chats = data.map(e => {
        let result = {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Chat;

        result.creationDate = this.getDateBySeconds(result.creationDate);

        return result;
      });
      console.log("chats: ", this.chats);
    });

    this.chatService.getAll("users").subscribe(data => {
      this.users = data.map(e => {
        let result = {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        };

        return result;
      });
      console.log("users: ", this.users);
    });

    this.chatService.getAll("vr").subscribe(data => {
      this.vr = data.map(e => {
        let result = {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        };

        return result;
      });
      console.log("vr: ", this.vr);
    });
  }

  getDateBySeconds(date) {
    return new Date(date.seconds * 1000);
  }

  login() {
    this.initChat = !this.initChat;
    // let user = this.users.filter(item => item.email == this.email)[0]
    // if(!user.length || user[0].password != this.password){
    //   return alert('E-mail e/ou senha incorretos.');
    // }
    // console.log(user)

    // this.logged = user;
    // this.oldChats = this.chats.filter(item => item.user.id == user[0].id);

    this.hoje = Date.now();
    this.logged = this.users[1];
    this.oldChats = [this.chats[0]];

    this.conversaAtual = [
      {
        bot: true,
        dialogo: `Oi ${this.logged.name}, tudo certo? Em que posso lhe ajudar?`,
        time: Date.now()
      }
    ];

    this.get_saldo_vr();

    this.scroll();
  }

  pergunta() {
    this.conversaAtual.push({
      bot: false,
      dialogo: this.message,
      time: Date.now()
    });

    this.chatService.getAnswers(this.message).subscribe(response => {
      let data = response.answers[0];

      let model = {
        bot: true,
        dialogo: "",
        time: Date.now()
      };

      if (data.metadata.length) {
        let arr = data.answer.split("_$");
        model.dialogo = arr
          .map((item, i) => {
            if (i > 0) {
              let variavel;
              let metadata = data.metadata[i - 1].value.split(".");
              metadata.forEach((meta, i) => {
                if (!i) {
                  variavel = this[meta];
                  return;
                }
                variavel = variavel[meta];
              });
              return variavel + item;
            }
            return item;
          })
          .join("");
      } else {
        model.dialogo = data.answer;
      }

      this.conversaAtual.push(model);
      this.scroll();
      this.message = "";
    });
  }

  get_saldo_vr() {
    this.chatService.getVrByIdUser(this.logged.id).subscribe(data => {
      this.saldoVR = data.map(e => {
        return {
          ...e.payload.doc.data()
        };
      })[0];
      console.log("saldo", this.saldoVR);
    });
  }

  scroll() {
    setTimeout(() => {
      let objScrDiv = document.querySelector(".chat .conversas");
      objScrDiv.scrollTop = objScrDiv.scrollHeight;
    }, 0);
  }

  close() {
    this.email = "";
    this.password = "";
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
