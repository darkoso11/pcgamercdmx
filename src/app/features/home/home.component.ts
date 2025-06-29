import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  typingText = '';
  fullText = 'El futuro es hoy, oiste viejo\nBienvenido a Pc Gamer CDMX';
  typingIndex = 0;
  typingSpeed = 40;

  // Slider superior derecho
  sliderImages = [
    { src: 'https://placehold.co/200x100/222/fff?text=Slider+1', link: '/productos/1', alt: 'Slider 1' },
    { src: 'https://placehold.co/200x100/0ea5e9/fff?text=Slider+2', link: '/productos/2', alt: 'Slider 2' }
  ];
  sliderIndex = 0;

  // Imagen de PC (puedes cambiar la ruta por una local en assets)
  pcBuilds = [
    { img: 'https://placehold.co/350x400/111/fff?text=PC+1', link: '/productos/1' },
    { img: 'https://placehold.co/350x400/0ea5e9/fff?text=PC+2', link: '/productos/2' }
  ];
  pcIndex = 0;

  ngOnInit() {
    this.typeText();
    setInterval(() => {
      this.sliderIndex = (this.sliderIndex + 1) % this.sliderImages.length;
      this.pcIndex = (this.pcIndex + 1) % this.pcBuilds.length;
    }, 4000);
  }

  typeText() {
    if (this.typingIndex < this.fullText.length) {
      this.typingText += this.fullText[this.typingIndex++];
      setTimeout(() => this.typeText(), this.typingSpeed);
    }
  }
}