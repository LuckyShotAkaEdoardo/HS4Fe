import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateName',
  standalone: true,
  pure: true,
})
export class TruncateNamePipe implements PipeTransform {
  transform(value: string, maxLength: number = 13): string {
    if (!value) return '';
    if (value.length <= maxLength) {
      return value;
    }
    return value.slice(0, maxLength) + '...';
  }
}
