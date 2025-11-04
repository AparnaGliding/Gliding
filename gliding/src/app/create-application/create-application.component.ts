import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-application',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-application.component.html',
  styleUrls: ['./create-application.component.scss']
})
export class CreateApplicationComponent {
  formData = {
    name: '',
    description: '',
    sourceUrl: '',
    username: '',
    password: '',
    crawlType: 'quick',
    maxDepth: 3,
    includeImages: true,
    includeExamples: true
  };

  constructor(private router: Router) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.canSubmit()) {
      const appId = this.formData.name.toLowerCase().replace(/\s+/g, '-');
      // Navigate to crawl progress page (to be implemented)
      this.router.navigate(['/apps', appId, 'crawl-progress']);
    }
  }

  canSubmit(): boolean {
    return this.formData.name.trim() !== '' && 
           this.formData.description.trim() !== '' && 
           this.formData.sourceUrl.trim() !== '';
  }

  goBack(): void {
    this.router.navigate(['/apps']);
  }
}
