import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nation } from '../../models/continent.model';

@Component({
    selector: 'app-surveyor-modal',
    imports: [CommonModule],
    templateUrl: './surveyor-modal.html',
    styles: ``,
})
export class SurveyorModalComponent {
    @Input() nation: Nation | null = null;
    @Output() close = new EventEmitter<void>();

    dispatchSuccess = false;

    onClose(): void {
        this.dispatchSuccess = false;
        this.close.emit();
    }

    requestUrgentDispatch(): void {
        this.dispatchSuccess = true;
        setTimeout(() => {
            this.dispatchSuccess = false;
        }, 4000);
    }
}
