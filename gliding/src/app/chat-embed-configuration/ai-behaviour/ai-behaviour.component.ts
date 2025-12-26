import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-behaviour',
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-behaviour.component.html',
  styleUrl: './ai-behaviour.component.scss'
})
export class AiBehaviourComponent {
  // Selection states
  selectedTone: string = 'casual';
  selectedLength: string = 'moderate';
  selectedFormality: string = 'balanced';
  
  // Custom instructions
  customInstructions: string = '';
  characterCount: number = 0;

  // Selection methods
  selectTone(tone: string): void {
    this.selectedTone = tone;
  }

  selectLength(length: string): void {
    this.selectedLength = length;
  }

  selectFormality(formality: string): void {
    this.selectedFormality = formality;
  }

  // Character count update
  updateCharacterCount(): void {
    this.characterCount = this.customInstructions.length;
  }

  // Action methods
  saveChanges(): void {
    console.log('Saving AI behaviour settings:', {
      tone: this.selectedTone,
      length: this.selectedLength,
      formality: this.selectedFormality,
      customInstructions: this.customInstructions
    });
    // Implement save logic here
  }

  discardChanges(): void {
    // Reset to default values
    this.selectedTone = 'casual';
    this.selectedLength = 'moderate';
    this.selectedFormality = 'balanced';
    this.customInstructions = '';
    this.characterCount = 0;
  }

  resetToDefault(): void {
    this.discardChanges();
  }
}
