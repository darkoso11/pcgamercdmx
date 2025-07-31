import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  public contacts: {
    href: string;
    icon: string;
    hoverColor: string;
  }[] =
  [{
    href: 'https://facebook.com/pcgamercdmx',
    icon: 'fa fa-facebook-f',
    hoverColor: 'bg-cyan'
  }];
  year: number = new Date().getFullYear();
}

