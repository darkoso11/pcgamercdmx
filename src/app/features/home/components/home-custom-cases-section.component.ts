import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface CustomCaseItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  tags: string[];
}

@Component({
  selector: 'app-home-custom-cases-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-custom-cases-section.component.html',
})
export class HomeCustomCasesSectionComponent {
  @Input({ required: true }) customCases: CustomCaseItem[] = [];
  selectedCustomCase: CustomCaseItem | null = null;

  selectCase(customCase: CustomCaseItem): void {
    this.selectedCustomCase = customCase;
  }

  closeModal(): void {
    this.selectedCustomCase = null;
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/gabinetes/BR-938686_1.png';
    img.onerror = null;
  }
}
