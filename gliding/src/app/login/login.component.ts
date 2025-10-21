import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { BannerService } from '../shared/banner.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string;
  password: string;

  constructor(
    private authService: AuthService,
    private bannerService: BannerService
  ) {}
}
