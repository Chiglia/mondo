import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
    selector: 'app-footer',
    imports: [CommonModule, TranslocoDirective],
    templateUrl: './footer.html',
    styles: ``,
})
export class FooterComponent {
    currentYear = new Date().getFullYear();
}
