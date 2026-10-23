import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissarioDto, NazioneDto } from '../../api/models';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
    selector: 'app-surveyor-modal',
    imports: [CommonModule, TranslocoDirective],
    templateUrl: './surveyor-modal.html',
    styles: ``,
})
export class SurveyorModalComponent {
    @Input() nation: NazioneDto | null = null;
    @Input() commissioners: CommissarioDto[] = [];
    @Input() loading = false;
    @Input() error: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() retry = new EventEmitter<void>();

    onClose(): void {
        this.close.emit();
    }
}
