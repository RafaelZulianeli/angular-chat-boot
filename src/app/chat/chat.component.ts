import { Component, OnInit } from "@angular/core";
import { ChatService } from "./chat.service";
import { map } from "rxjs/operators";
import { AngularFirestore } from "@angular/fire/firestore";
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
  activeFunctions = [];

  constructor(
    private chatService: ChatService,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {
    this.chatService.getAll("chats").subscribe(data => {
      this.chats = data.map(e => {
        let result = {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as Chat;

        result.creationDate = result.creationDate;

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

  // getDateBySeconds(date) {
  //   return new Date(date.seconds * 1000);
  // }

  login() {
    // let user = this.users.filter(item => item.email == this.email)[0];
    // if (!user || user.password != this.password) {
    //   return alert("E-mail e/ou senha incorretos.");
    // }
    this.initChat = !this.initChat;
    // console.log(user);

    // this.logged = user;
    // this.oldChats = this.chats.filter(item => item.user.id == user.id);

    this.hoje = Date.now();
    this.logged = this.users[1];
    this.oldChats = this.chats;

    this.conversaAtual = [
      {
        bot: true,
        dialogo: `Oi ${this.logged.name}, tudo certo? Em que posso lhe ajudar?`,
        time: Date.now()
      }
    ];

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

      let metadata = data.metadata[0];

      if (metadata) {
        let arr = data.answer.split("_$");
        if (metadata.name == "object") {
          model.dialogo = this.mapMetadataObject(arr, metadata);
          this.conversaAtual.push(model);
        } else {
          this.mapMetadataFunction(arr, metadata).subscribe(res => {
            model.dialogo = res;
            this.conversaAtual.push(model);
          });
        }
      } else {
        model.dialogo = data.answer;
        this.conversaAtual.push(model);
      }

      console.log("model", model);
      this.scroll();
      this.message = "";
    });
  }

  mapMetadataFunction(arr, metadata) {
    this.activeFunctions.push(metadata.value);
    return this[metadata.value]().pipe(
      map(res => {
        console.log(res);
        return arr
          .map((item, i) => {
            if (i) {
              return res.toFixed(2) + item;
            }
            return item;
          })
          .join("");
      })
    );
  }

  get_saldo_vr() {
    return this.chatService.getVrByIdUser(this.logged.id).pipe(
      map(data => {
        return data.map(e => {
          return {
            ...e.payload.doc.data()
          };
        })[0].value;
      })
    );
  }

  mapMetadataObject(arr, metadata) {
    return arr
      .map((item, i) => {
        if (i) {
          let variavel;
          let objKeys = metadata.value.split(".");
          objKeys.forEach((key, j) => {
            if (!j) {
              variavel = this[key];
              return;
            }
            variavel = variavel[key];
          });
          return variavel + item;
        }
        return item;
      })
      .join("");
  }

  scroll() {
    setTimeout(() => {
      let objScrDiv = document.querySelector(".chat .conversas");
      // console.log(objScrDiv)
      objScrDiv.scrollTop = objScrDiv.scrollHeight;
    }, 0);
  }

  close() {
    // let date = new Date().getTime()
    let chat = {
      conteudo: this.conversaAtual,
      creationDate: Date.now(),
      funcoes: this.activeFunctions,
      // id: this.afs.createId(),
      status: 1,
      user: {
        id: this.logged.id,
        email: this.logged.email
      }
    };

    this.create(chat).then(res => {
      console.log(res);

      this.email = "";
      this.password = "";
      this.logged = null;
      this.initChat = !this.initChat;
    });
  }

  create(chat: Chat) {
    return this.chatService.saveChat(chat);
  }

  update(chat: Chat) {
    this.chatService.updateChat(chat);
  }

  delete(id: string) {
    this.chatService.remove(id);
  }
}
