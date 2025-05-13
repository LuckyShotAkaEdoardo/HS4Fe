import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appDoubleTap]',
  standalone: true,
})
export class DoubleTapDirective {
  @Output() singleTap = new EventEmitter<void>();
  @Output() doubleTap = new EventEmitter<void>();

  private lastTapTime = 0;
  private timeout: ReturnType<typeof setTimeout> | null = null;

  @HostListener('click', ['$event'])
  handleClick(event: MouseEvent): void {
    const now = Date.now();
    const timeDiff = now - this.lastTapTime;

    if (timeDiff < 300) {
      // doppio tap: cancella singolo e emetti doppio
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.doubleTap.emit();
    } else {
      // potenziale singolo: aspetta 300ms per vedere se ne arriva un altro
      this.timeout = setTimeout(() => {
        this.singleTap.emit();
        this.timeout = null;
      }, 300);
    }

    this.lastTapTime = now;
  }
}
