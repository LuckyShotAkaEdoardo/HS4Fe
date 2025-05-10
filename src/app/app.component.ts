import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { getDecodedToken } from './auth/login/jwt-decoder';
import { SocketService } from '../service/socket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  socketService = inject(SocketService);
  ngOnInit(): void {
    // const token = getDecodedToken();
    // console.log(token.username);
    // if (token.username) this.socketService.socketLogin(token.username);
  }
  title = 'HS4';
}
