import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommandConfigService } from '../app/service/command-config.service';

@Directive({
  selector: '[appLongPress]',
})
export class LongPressDirective implements OnInit {
  @Input() context = ''; // es: "deck-builder"
  @Input() commandData: any; // dati associati alla carta o entità
  @Output() longPress = new EventEmitter<void>(); // utile se vuoi mantenere compatibilità

  private pressTimeout: any;
  private longPressFired = false;

  constructor(private commandService: CommandConfigService) {}

  ngOnInit(): void {
    if (!this.context) {
      console.warn('Devi fornire un [context] a [appLongPress]');
    }
  }

  @HostListener('touchstart', ['$event'])
  @HostListener('mousedown', ['$event'])
  onPressStart() {
    this.longPressFired = false;
    this.pressTimeout = setTimeout(() => {
      this.longPressFired = true;
      this.executeCommand('longPress');
    }, 500);
  }

  @HostListener('touchend')
  @HostListener('mouseup')
  @HostListener('mouseleave')
  cancelPress() {
    clearTimeout(this.pressTimeout);
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.longPressFired) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.executeCommand('click');
  }

  private executeCommand(type: 'click' | 'longPress') {
    const command = this.commandService.getCommand(this.context, type);
    switch (command) {
      case 'addToDeck':
        console.log('👉 Aggiungi al mazzo:', this.commandData);
        // Qui potresti emettere un evento o usare un servizio globale
        break;
      case 'zoom':
        console.log('🔍 Zoom:', this.commandData);
        // Apri modale zoom, esempio:
        // this.dialog.open(...);
        break;
      case 'selectCard':
        console.log('🎯 Seleziona:', this.commandData);
        break;
      case 'none':
      default:
        console.log('🚫 Nessuna azione definita');
        break;
    }
  }
}
