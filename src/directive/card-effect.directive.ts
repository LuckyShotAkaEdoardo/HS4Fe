import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
export const VISUAL_ANIMATION_DURATION = 1000; // ms
export const VISUAL_CLEANUP_DELAY = 100; // ms
@Directive({
  selector: '[cardEffectHighlight]',
})
export class CardEffectHighlightDirective implements OnChanges {
  @Input('cardEffectHighlight') effectType: string | undefined;

  private previousClass: string | undefined;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['effectType']) {
      const el = this.el.nativeElement;

      if (this.previousClass) {
        el.classList.remove(this.previousClass);
      }

      if (this.effectType) {
        const normalizedClass = this.normalizeEffectType(this.effectType);
        el.classList.add(normalizedClass);
        this.previousClass = normalizedClass;

        setTimeout(() => {
          el.classList.remove(normalizedClass);
          this.previousClass = undefined;
        }, VISUAL_ANIMATION_DURATION);
      }
    }
  }

  private normalizeEffectType(effectType: string): string {
    return `effect-${effectType.toLowerCase()}`;
  }
}
