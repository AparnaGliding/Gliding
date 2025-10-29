import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { Router } from '@angular/router';
import { AuthService, UserSignUpModel } from '../auth/auth.service';
import { BannerService } from '../shared/banner.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  agreeToTerms: boolean = false;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private bannerService: BannerService,
    private router: Router
  ) {}

  signUp(): void {
    // Validation
    if (!this.fullName || !this.email || !this.password) {
      this.bannerService.showError('Please fill in all required fields');
      return;
    }

    if (!this.agreeToTerms) {
      this.bannerService.showError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.bannerService.showError('Please enter a valid email address');
      return;
    }

    if (this.password.length < 6) {
      this.bannerService.showError('Password must be at least 6 characters long');
      return;
    }

    const signUpData: UserSignUpModel = {
      fullName: this.fullName,
      email: this.email,
      password: this.password
    };

    this.isLoading = true;

    this.authService.signUp(signUpData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.bannerService.showSuccess('Account created successfully! Please sign in.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Sign up error:', error);
        
        // Handle different error scenarios
        if (error.status === 400) {
          this.bannerService.showError('Invalid input. Please check your information.');
        } else if (error.status === 409) {
          this.bannerService.showError('An account with this email already exists.');
        } else {
          this.bannerService.showError('Failed to create account. Please try again.');
        }
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
