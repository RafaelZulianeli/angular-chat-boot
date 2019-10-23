import { Component, OnInit } from "@angular/core";
import { ChatService } from "./chat.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AngularFirestore } from "@angular/fire/firestore";
import { Chat } from "./chat.model";
import { faPaperPlane, faShare, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "chat-list",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"]
})
export class ChatComponent implements OnInit {
  standalone = { standalone: true };

  chats: Chat[];
  faPaperPlane = faPaperPlane;
  faShare = faShare;
  faArrowLeft = faArrowLeft;
  initChat = false;

  users;
  vr;
  email;
  password;

  logged;
  oldChats;
  hoje;
  link;

  saldoVR;

  message = '';
  conversaAtual = [];
  activeFunctions = [];

  private metadataType = {
    ["function"]: "mapMetadataFunction",
    ["object"]: "mapMetadataObject",
    ["link"]: "mapMetadataLink"
  };

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
        // result.conteudo.sort((a, b) => b.time - a.time);
        console.log(result);

        return result;
      });
      this.chats.sort((a, b) => a.creationDate - b.creationDate);
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

    let primeiraApresentacao = `Olá ${this.logged.name}! Eu sou o Hub. Estou aqui para te ajudar. Qual a sua dúvida?`;
    let jaNosConhecemos = `Oi ${this.logged.name}! Fico feliz em vê-lo aqui novamente. Qual a sua dúvida?`
    this.conversaAtual = [
      {
        bot: true,
        dialogo: this.oldChats.length ? jaNosConhecemos : primeiraApresentacao,
        time: Date.now(),
        link: "",
        prompts: []
      }
    ];

    this.scroll();
  }

  pergunta() {

    if(!this.message.trim()) return;

    this.conversaAtual.push({
      bot: false,
      dialogo: this.message,
      time: Date.now(),
      link: "",
      prompts: []
    });

    this.chatService.getAnswers(this.message).subscribe(response => {

      console.log('response',response)

      let data = response.answers[0];
      let model = {
        bot: true,
        dialogo: "",
        time: Date.now(),
        link: "",
        prompts: data.context.prompts
      };

      let metadata = data.metadata[0];
      if (metadata) {
        this.analisaMetada(data, metadata, model);
      } else {
        model.dialogo = data.answer;
        this.conversaAtual.push(model);
      }

      console.log("model: ", model);
      this.scroll();
      this.message = "";
    });
  }

  analisaMetada(data, metadata, model) {
    let arr = data.answer.split("_$");

    this[this.metadataType[metadata.name]](arr, metadata).subscribe(res => {
      model.dialogo = res;
      model.link = this.link;
      this.conversaAtual.push(model);
    });
  }

  perguntaQnaId(item) {
    this.conversaAtual.push({
      bot: false,
      dialogo: item.displayText,
      time: Date.now(),
      link: "",
      prompts: []
    });

    this.chatService.getAnswersQnaId(item.qnaId).subscribe(response => {
      console.log('responseQnaId',response)
      let data = response.answers[0];
      let model = {
        bot: true,
        dialogo: "",
        time: Date.now(),
        link: "",
        prompts: data.context.prompts
      };

      let metadata = data.metadata[0];
      if (metadata) {
        this.analisaMetada(data, metadata, model);
      } else {
        model.dialogo = data.answer;
        this.conversaAtual.push(model);
      }

      console.log("modelQna: ", model);
      this.scroll();
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
    return Observable.create(observer => {
      observer.next(
        arr
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
          .join("")
      );
    });
  }

  mapMetadataLink(arr, metadata) {
    return Observable.create(observer => {
      this.link = metadata.value;
      observer.next(arr.join(""));
    });
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
