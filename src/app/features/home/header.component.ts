import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  typingText = '';
  fullText = 'El futuro es hoy, ¿oíste viejo? Bienvenido a PC Gamer CDMX';
  typingIndex = 0;
  typingSpeed = 45;

  // Slider editable (simula CMS)
  sliderImages = [
    { src: 'https://placehold.co/120x80/0ea5e9/fff?text=Promo+1', link: '/productos/1' },
    { src: 'https://placehold.co/120x80/ec4899/fff?text=Promo+2', link: '/productos/2' },
    { src: 'https://placehold.co/120x80/9333ea/fff?text=Promo+3', link: '/productos/3' }
  ];
  sliderIndex = 0;

  // Ensambles PC (simula CMS)
  pcBuilds = [
    { img: 'https://placehold.co/320x400/0ea5e9/fff?text=PC+1', link: '/productos/1' },
    { img: 'https://placehold.co/320x400/ec4899/fff?text=PC+2', link: '/productos/2' },
    { img: 'https://placehold.co/320x400/9333ea/fff?text=PC+3', link: '/productos/3' }
  ];
  pcIndex = Math.floor(Math.random() * 3);

  ngOnInit() {
    this.typeText();
    setInterval(() => {
      this.sliderIndex = (this.sliderIndex + 1) % this.sliderImages.length;
    }, 3500);
  }

  typeText() {
    if (this.typingIndex < this.fullText.length) {
      this.typingText += this.fullText[this.typingIndex++];
      setTimeout(() => this.typeText(), this.typingSpeed);
    }
  }
}
