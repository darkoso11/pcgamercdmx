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

  // Slider superior derecho con Lorem Picsum
  sliderImages = [
    { src: 'https://picsum.photos/id/11/200/100', link: '/productos/1', alt: 'Slider 1' },
    { src: 'https://picsum.photos/id/12/200/100', link: '/productos/2', alt: 'Slider 2' },
    { src: 'https://picsum.photos/id/13/200/100', link: '/productos/3', alt: 'Slider 3' }
  ];
  sliderIndex = 0;

  // Imagen de PC usando Lorem Picsum
  pcBuilds = [
    { img: 'https://picsum.photos/id/14/350/400', link: '/productos/1' },
    { img: 'https://picsum.photos/id/15/350/400', link: '/productos/2' }
  ];
  pcIndex = 0;

  ngOnInit(): void {
    this.typeText();
    // Añade la rotación de imágenes del slider y PC
    setInterval(() => {
      this.sliderIndex = (this.sliderIndex + 1) % this.sliderImages.length;
      this.pcIndex = (this.pcIndex + 1) % this.pcBuilds.length;
    }, 4000);
  }

  // Función para escribir texto con efecto typing
  typeText(): void {
    if (this.typingIndex < this.fullText.length) {
      this.typingText += this.fullText[this.typingIndex++];
      setTimeout(() => this.typeText(), this.typingSpeed);
    }
  }
}
