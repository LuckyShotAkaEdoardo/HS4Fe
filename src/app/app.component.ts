import { Component, inject, OnInit } from '@angular/core';
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
  displayService = inject(DisplaySettingsService);
  ngOnInit(): void {
    // const token = getDe
    // codedToken();
    // console.log(token.username);
    // if (token.username) this.socketService.socketLogin(token.username);
    this.forceFullscreenIfUnset();
  }
  title = 'HS4';
  forceFullscreenIfUnset() {
    // controlla se il valore esiste nello storage
    console.log('sei in metodo full screen');
    const raw = localStorage.getItem('display_settings') ?? '';

    if (!raw) {
      // nessuna impostazione salvata: forziamo il fullscreen e salviamo
      this.displayService.toggleFullscreen();
      console.log('Fullscreen forzato: nessuna configurazione trovata');
    } else {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed.fullscreen) {
          this.displayService.toggleFullscreen();
          console.log('Fullscreen forzato: fullscreen disattivo');
        }
      } catch {
        this.displayService.toggleFullscreen();
        console.log('Fullscreen forzato: configurazione corrotta');
      }
    }
  }
}
