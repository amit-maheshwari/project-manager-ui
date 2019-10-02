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

  close() {
    this.sessionService.showAlert = false;
  }

  get showAlert(): boolean {
    return this.sessionService.showAlert;
  }

}
