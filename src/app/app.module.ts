import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { AngularFireModule } from "@angular/fire";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFirestore } from "@angular/fire/firestore";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from "./app.component";
import { HelloComponent } from "./hello.component";
import { ChatComponent } from "./chat/chat.component";
import { environment } from "./environments/environment";

import { ChatService } from "./chat/chat.service";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    FontAwesomeModule
  ],
  declarations: [AppComponent, HelloComponent, ChatComponent],
  providers: [ChatService, AngularFirestore],
  bootstrap: [AppComponent]
})
export class AppModule {}
