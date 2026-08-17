import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  currentLanguage: 'en' | 'ar' = 'en';

  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  translations = {

    en: {
      title: 'Trip Management System',
      email: 'Enter your employee number',
      password: 'Enter your password',
      login: 'Login'
    },

    ar: {
      title: 'نظام إدارة الرحلات',
      email: 'أدخل الرقم الوظيفي',
      password: 'أدخل كلمة المرور',
      login: 'تسجيل الدخول'
    }

  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  changeLanguage(language: 'en' | 'ar') {
    this.currentLanguage = language;
  }

  login() {

    console.log('🔥 LOGIN BUTTON CLICKED');

    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.username, this.password).subscribe({

      next: (response) => {

        console.log('🔥 API RESPONSE:', response);
        console.log('🔥 ROLE:', response.role);

        localStorage.setItem(
          'currentUser',
          JSON.stringify(response)
        );

        this.isLoading = false;

        if (response.role === 'HR_MANAGER') {

          console.log('🔥 GOING TO HR APPROVAL');

          this.router.navigate(['/admin/trips/approvals'])
            .then(result => {
              console.log('🔥 NAVIGATION RESULT:', result);
            })
            .catch(error => {
              console.error('🔥 NAVIGATION ERROR:', error);
            });

        }

        else if (response.role === 'HR_ADMIN') {

          this.router.navigate(['/admin/trips/create']);

        }

        else if (response.role === 'LINE_MANAGER') {

          this.router.navigate(['/manager-history']);

        }

        else {

          this.router.navigate(['/employee-dashboard']);

        }

      },

      error: (error) => {

        console.error('🔥 LOGIN API ERROR:', error);

        this.isLoading = false;
        this.errorMessage = 'Invalid username or password';

      }

    });

  }
}