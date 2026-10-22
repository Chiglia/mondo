import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './services/language-service';
import { AvariaService } from './services/avaria.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [],
})
export class App {
  private langService = inject(LanguageService);
  private avariaService = inject(AvariaService);

  constructor() {
    void this.avariaService.loadApiDirectory(this.langService.currentLang);
  }
}
