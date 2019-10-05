import { Component } from '@angular/core';
import {SessionService} from './session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {

  title = 'angular-bootstrap-demo';

  constructor(private sessionService: SessionService) {
  }



  get message() {
    return this.sessionService.errorMessage;
  }

  get successMessage(){
    return this.sessionService.successMessage;
  }

  close() {
    this.sessionService.showAlert = false;
    this.sessionService.successMessage = false;
  }

  get showAlert(): boolean {
    if(this.sessionService.showAlert){
       const that = this;
          setTimeout(function(){
            that.sessionService.showAlert =false;
          },5000);
    }
    return this.sessionService.showAlert;
  }

   get showSuccess(): boolean {
      if(this.sessionService.successMessage){
         const that = this;
            setTimeout(function(){
              that.sessionService.showSuccessMessage =false;
            },5000);
      }
      return this.sessionService.showSuccessMessage;
    }

}
