import {Component, OnInit, AfterViewInit} from '@angular/core';
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
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit{
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
    (window as any).onGoogleCredential = (res: any) => {
      const idToken = res.credential; // real JWT

      const claims = this.decodeJwt<{
        email?: string;
        name?: string;
        picture?: string;
        given_name?: string;
        family_name?: string;
      }>(idToken) || {};

      this.googleSignIn(idToken, {
        name: claims.name || '',
        email: claims.email || ''
      });
    };
  }


  private decodeJwt<T = any>(token: string): T | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
  ngAfterViewInit(): void {
    const clientId = '705349747162-aorcutjttal4l6d37inu46bird35t2g5.apps.googleusercontent.com';
    const ensureRender = () => {
      const w = window as any;
      if (!w.google) return false;
      try {
        w.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res: any) => (window as any).onGoogleCredential(res)
        });
        const el = document.getElementById('googleBtn');
        if (el) {
          w.google.accounts.id.renderButton(el, {
            type: 'standard',
            size: 'large',
            theme: 'outline',
            text: 'signin_with'
          });
        }
        return true;
      } catch {
        return false;
      }
    };

    if (!ensureRender()) {
      const timer = setInterval(() => {
        if (ensureRender()) clearInterval(timer);
      }, 200);
      setTimeout(() => clearInterval(timer), 5000);
    }
  }

  logInByPassword() {
    if (!this.email || !this.password) {
      return;
    }
    const credentials = {
      email: this.email,
      password: this.password,
      rememberMe: true
    };
    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate(['/apps']);
        } else {
          console.log('Login failed');
        }
      },
      error: (error) => {
        console.error('Login error', error);
      }
    });
  }

  navigateToSignup(): void {
    this.router.navigate(['auth/signup']);
  }

  googleSignIn(credential?: string, profile?: { name?: string; email?: string }): void {
    const payload = {
      token: credential || '',
      name: (profile && profile.name) || '',
      email: (profile && profile.email) || ''
    };

    this.authService.googleSignOn(payload).subscribe({
      next: () => {
        try {
          if (profile?.name) localStorage.setItem('userName', profile.name);
        } catch {}
        this.router.navigate(['/apps']);
      },
      error: (err) => console.error('Google sign-in failed', err)
    });
  }
}
