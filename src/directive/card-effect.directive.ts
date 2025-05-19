import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[cardEffectHighlight]',
})
export class CardEffectHighlightDirective {
  @Input('cardEffectHighlight') set highlight(className: string | undefined) {
    if (!className) return;

    const el = this.el.nativeElement;
    el.classList.add(className);

    setTimeout(() => {
      el.classList.remove(className);
    }, 1000); // durata animazione (modifica se serve)
  }

  constructor(private el: ElementRef) {}
}
