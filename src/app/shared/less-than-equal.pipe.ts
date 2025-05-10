import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lte', // nome da usare in template
})
export class LessThanEqualPipe implements PipeTransform {
  /**
   * Se passi solo il valore, fa value <= 9
   * Se passi anche il parametro max, fa value <= max
   */
  transform(value: number | string, max: number = 9): boolean {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num <= max;
  }
}
