import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-download-button',
  imports: [],
  templateUrl: './download-button.component.html',
  styleUrl: './download-button.component.scss',
})
export class DownloadButtonComponent {
  @Input() textToSave: string = '';
  @Input() fileName: string = 'file.txt';
  @Input() isLoading: boolean = false;

  icon = 'bi-download';
  text = 'Download';

  download(): void {
    const blob = new Blob([this.textToSave], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cowrite_${this.fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.icon = 'bi-check2-circle animate-bounce';
    this.text = 'Downloaded!';
    setTimeout(() => {
      this.icon = 'bi-download';
      this.text = 'Download';
    }, 2000);
  }
}
