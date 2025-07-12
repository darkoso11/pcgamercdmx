import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Esta importación es necesaria aunque el linter la marque como no usada
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'PC Gamer CDMX';
}
