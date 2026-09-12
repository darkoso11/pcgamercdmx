import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BUSINESS_INFO } from '../../shared/config/business-info';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  readonly business = BUSINESS_INFO;
}
