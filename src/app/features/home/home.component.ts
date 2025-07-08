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
    { img: 'assets/img/placeholder-pc1.png', link: '/productos/1' },
    { img: 'assets/img/placeholder-pc2.png', link: '/productos/2' }
  ];
  pcIndex = 0;

  // Elimina el array ensambles y usa el array que me diste:
  carruselProducts = [
    {
      id: 1,
      title: "CPU PRE ARMADO 1",
      powerCertificate: "assets/img/80plusgold.png",
      image: "assets/img/Gabinetes/HBJNKHG+NM.png",
      graphicsCardIMG: "assets/img/ryzen_tag.svg",
      processorIMG: "assets/img/intel_tag.svg",
      caseIMG: "assets/img/3500X_LINK_BLK_01.webp",
      caseBrand: "assets/img/corsairbrand.png",
      watts: 500,
      price: 11111,
      processor: "AMD RYZEN 7 5700",
      motherboard: "ASUS PRIME A520M K",
      graphicsCard: "ASUS DUAL-RTX3050-6G",
      ram: "16 GB MEMORIA",
      storage: " SSD M.2 INTERNO NVME 1TB ",
      powerSupply: "GIGABYTE 850W 80 PLUS GOLD",
      case: "ACTECK PERFORMANCE II NEGRO",
      coolant: "",
      slug: "cpu-pre-armado-1"
    },
    {
      id: 2,
      title: "CPU PRE Armado 2",
      powerCertificate: "assets/img/80plusgold.png",
      image: "assets/img/Gabinetes/HBJNKHG+NM.png",
      graphicsCardIMG: "assets/img/ryzen_tag.svg",
      processorIMG: "assets/img/intel_tag.svg",
      caseIMG: "assets/img/3500X_LINK_BLK_01.webp",
      caseBrand: "assets/img/corsairbrand.png",
      watts: 850,
      price: 26000,
      processor: "INTEL I5 12400F",
      motherboard: "MSI B760M PROJECT ZERO",
      graphicsCard: "GIGABYTE RX 7600XT, 16GB",
      ram: "32GB DDR5",
      storage: " SSD M.2 INTERNO NVME 1TB ",
      powerSupply: "GIGABYTE 850W 80 PLUS GOLD",
      case: "CORSAIR 3500X",
      coolant: "LIQUID 360 SUB ZERO",
      slug: "cpu-pre-armado-2"
    },
    {
      id: 3,
      title: "CPU PRE Armado 3",
      powerCertificate: "assets/img/80plusgold.png",
      image: "assets/img/HBJNKHG+NM.png",
      graphicsCardIMG: "assets/img/ryzen_tag.svg",
      processorIMG: "assets/img/intel_tag.svg",
      caseIMG: "assets/img/3500X_LINK_BLK_01.webp",
      caseBrand: "assets/img/corsairbrand.png",
      watts: 750,
      price: 29620,
      processor: "INTEL CORE 15-12400F",
      motherboard: "MB MSI B760M PROJECT ZERO",
      graphicsCard: "RADEON RX 9070 XT 16GB",
      ram: "16 GB MEMORIA RAM DDR5",
      storage: " SSD M.2 INTERNO NV 1TB ",
      powerSupply: "MSI MAG 750W 80 PLUS BRONZE",
      case: " BALAM RUSH TANK",
      coolant: "OCELOT LIQUIDO 360MM",
      slug: "cpu-pre-armado-3"
    },
    {
      id: 4,
      title: "CPU PRE Armado 4",
      powerCertificate: "assets/img/80plusgold.png",
      image: "assets/img/Gabinetes/HBJNKHG+NM.png",
      graphicsCardIMG: "assets/img/ryzen_tag.svg",
      processorIMG: "assets/img/intel_tag.svg",
      caseIMG: "assets/img/3500X_LINK_BLK_01.webp",
      caseBrand: "assets/img/corsairbrand.png",
      watts: 850,
      price: 41852,
      processor: "AMD Ryzen 7 8700F",
      motherboard: "MSI B650M GAMING PLUS WIFI",
      graphicsCard: "GIGABYTE 5070 RTX, 12GB GDDR7",
      ram: "32GB DIMM DDR5",
      storage: " SSD M.2 INTERNO NVME 1TB ",
      powerSupply: "GIGABYTE 850W 80 PLUS GOLD",
      case: "CORSAIR 3500X",
      coolant: "EVGA 240CM CON DISPLAY",
      slug: "cpu-pre-armado-4"
    },
    {
      id: 5,
      title: "CPU PRE Armado",
      powerCertificate: "assets/img/80plusgold.png",
      image: "assets/img/HBJNKHG+NM.png",
      graphicsCardIMG: "assets/img/ryzen_tag.svg",
      processorIMG: "assets/img/intel_tag.svg",
      caseIMG: "assets/img/3500X_LINK_BLK_01.webp",
      caseBrand: "assets/img/corsairbrand.png",
      watts: 1000,
      price: 44444,
      processor: "INTEL I9 14900F",
      motherboard: "MSI Z790 PROJECT ZERO",
      graphicsCard: "RADEON RX 9070 XT 16GB",
      ram: "32GB DIMM DDR5",
      storage: " SSD M.2 INTERNO NV 1TB ",
      powerSupply: "ASUS 1000W 80 PLUS GOLD",
      case: "CORSAIR 3500X",
      coolant: "LIQUID 360 SUB ZERO",
      slug: "cpu-pre-armado-5"
    }
  ];
  currentProductIndex = 0;

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

  prevProduct() {
    this.currentProductIndex = (this.currentProductIndex - 1 + this.carruselProducts.length) % this.carruselProducts.length;
  }
  nextProduct() {
    this.currentProductIndex = (this.currentProductIndex + 1) % this.carruselProducts.length;
  }
}