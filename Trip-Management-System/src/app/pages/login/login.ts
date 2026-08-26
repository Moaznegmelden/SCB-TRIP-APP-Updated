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

    this.errorMessage =
      'Please enter username and password';

    return;
  }

  this.isLoading = true;

  this.authService
    .login(
      this.username,
      this.password
    )
    .subscribe({

      next: (response) => {

        console.log(
          '🔥 API RESPONSE:',
          response
        );

        console.log(
          '🔥 ROLE:',
          response.role
        );


        // =====================================================
        // CURRENT USER
        //
        // IMPORTANT:
        // sessionStorage is intentional.
        //
        // Each browser tab gets its own logged-in user.
        // =====================================================

        sessionStorage.setItem(
          'currentUser',
          JSON.stringify(response)
        );


        // =====================================================
        // LOGIN SUCCESS
        // =====================================================

        this.isLoading = false;


        console.log(
          '🔥 LOGIN SUCCESS - GOING TO ACTIVE TRIPS'
        );


        // =====================================================
        // ALL ROLES START FROM ACTIVE TRIPS
        //
        // Employee
        // Line Manager
        // HR Admin
        // HR Manager
        // =====================================================

        this.router
          .navigate([
            '/employee-dashboard'
          ])

          .then(result => {

            console.log(
              '🔥 NAVIGATION RESULT:',
              result
            );

          })

          .catch(error => {

            console.error(
              '🔥 NAVIGATION ERROR:',
              error
            );

          });

      },


      error: (error) => {

        console.error(
          '🔥 LOGIN API ERROR:',
          error
        );

        this.isLoading = false;

        this.errorMessage =
          'Invalid username or password';

      }

    });
}
}