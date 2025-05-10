// range.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'range',
  standalone: true, // Se usi Angular 15+ con standalone components
})
export class RangePipe implements PipeTransform {
  transform(start: number, count: number): number[] {
    return Array.from({ length: count }, (_, i) => start + i);
  }
}
