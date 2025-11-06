import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateApplicationService } from './create-application.service';
import { AddApplicationModel } from './create-application.model';

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

  isSubmitting = false;
  messageText: string | null = null;
  messageType: 'success' | 'error' | null = null;

  constructor(private router: Router, private createApplicationService: CreateApplicationService) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit() || this.isSubmitting) { return; }
    this.isSubmitting = true;

    const payload: AddApplicationModel = {
      name: this.formData.name,
      url: this.formData.sourceUrl,
      username: this.formData.username,
      password: this.formData.password,
      userId: 1,
      accountId: 1
    };

    this.createApplicationService.addApp(payload).subscribe({
      next: (ok) => {
        this.isSubmitting = false;
        if (ok === true) {
          this.messageType = 'success';
          this.messageText = 'authentication is succesfulle start crawl proces';
        } else {
          this.messageType = 'error';
          this.messageText = 'authentication failed';
        }
        setTimeout(() => { this.messageText = null; this.messageType = null; }, 3000);
      },
      error: () => {
        this.isSubmitting = false;
        this.messageType = 'error';
        this.messageText = 'authentication failed';
        setTimeout(() => { this.messageText = null; this.messageType = null; }, 3000);
      }
    });
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
