import {Component, OnInit} from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { BannerService } from '../shared/banner.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import {Router} from '@angular/router';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  email: string;
  password: string;
  remember: boolean;

  constructor(
    private authService: AuthService,
    private bannerService: BannerService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
  }

  logInByPassword() {
    if (!this.email || !this.password) {
      return;
    }
    const credentials = {
      email: this.email,
      password: this.password
    };
    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
      }
    });
  }
}
