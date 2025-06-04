import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fancy',
})
export class FancyDatePipe implements PipeTransform {
  transform(value: Date | string): string {
    const d = new Date(value);

    const day = d.getDate();
    const weekday = d.toLocaleString('en-US', { weekday: 'long' });
    const month = d.toLocaleString('en-US', { month: 'long' });
    const year = d.getFullYear();
    const hours = d.getHours() % 12 || 12;
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM';

    const getOrdinal = (n: number): string => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    return `${weekday}, ${day}${getOrdinal(
      day
    )} ${month} ${year} at ${hours}:${minutes} ${ampm}`;
  }
}
