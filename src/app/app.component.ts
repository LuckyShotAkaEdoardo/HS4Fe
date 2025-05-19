import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { getDecodedToken } from './auth/login/jwt-decoder';
import { SocketService } from '../service/socket.service';
import { SettingsComponent } from './shared/settings-component/settings-component.component';
import { DisplaySettingsService } from '../service/display-settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SettingsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  socketService = inject(SocketService);
  @ViewChild('animOutlet', { read: ViewContainerRef })
  vcRef!: ViewContainerRef;

  ngOnInit(): void {
    // const token = getDe
    // codedToken();
    // console.log(token.username);
    // if (token.username) this.socketService.socketLogin(token.username);
  }
  title = 'HS4';
}
