import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[cardEffectHighlight]',
})
export class CardEffectHighlightDirective implements OnChanges {
  @Input('cardEffectHighlight') effectType: string | undefined;

  private previousClass: string | undefined;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['effectType'] && this.effectType) {
      const el = this.el.nativeElement;

      // Rimuovi la classe precedente se esiste
      if (this.previousClass) {
        el.classList.remove(this.previousClass);
      }

      el.classList.add(this.effectType);
      this.previousClass = this.effectType;

      setTimeout(() => {
        el.classList.remove(this.effectType!);
      }, 1000); // durata animazione
    }
  }
}
