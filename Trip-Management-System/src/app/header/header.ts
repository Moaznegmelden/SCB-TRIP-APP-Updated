import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface CurrentUser {
  employeeId: number;
  employeeNumber: string;
  fullName: string;
  email: string;
  role: string;
  token: string;
}

@Component({
  selector: 'app-header',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {

  currentUser: CurrentUser | null = null;

  role = '';


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    const storedUser =
      sessionStorage.getItem('currentUser');


    if (!storedUser) {

      return;
    }


    try {

      this.currentUser =
        JSON.parse(storedUser);


      this.role =
        this.currentUser?.role
          ?.toUpperCase()
          ?.trim() || '';


      console.log(
        '🔥 HEADER USER:',
        this.currentUser
      );


      console.log(
        '🔥 HEADER ROLE:',
        this.role
      );

    } catch (error) {

      console.error(
        '🔥 HEADER USER PARSE ERROR:',
        error
      );

      this.currentUser = null;

      this.role = '';
    }
  }


  // =========================================================
  // ROLE CHECKS
  // =========================================================

  isEmployee(): boolean {

    return this.role === 'EMPLOYEE';
  }


  isLineManager(): boolean {

    return this.role === 'LINE_MANAGER';
  }


  isHrAdmin(): boolean {

    return this.role === 'HR_ADMIN';
  }


  isHrManager(): boolean {

    return this.role === 'HR_MANAGER';
  }


  // =========================================================
  // TASK ACCESS
  //
  // Employee       → NO Tasks
  // Line Manager   → Tasks
  // HR Admin       → Tasks
  // HR Manager     → Tasks
  // =========================================================

  hasTasks(): boolean {

    return (
      this.isLineManager() ||
      this.isHrAdmin() ||
      this.isHrManager()
    );
  }


  // =========================================================
  // CREATE TRIPS
  //
  // HR ADMIN ONLY
  // =========================================================

  canCreateTrips(): boolean {

    return this.isHrAdmin();
  }


  // =========================================================
  // APPROVAL HISTORY
  //
  // LINE MANAGER ONLY
  // =========================================================

  canViewApprovalHistory(): boolean {

    return this.isLineManager();
  }


  // =========================================================
  // DISPLAY NAME
  // =========================================================

  get displayName(): string {

    if (!this.currentUser?.fullName) {

      return '';
    }

    return this.currentUser.fullName;
  }


  // =========================================================
  // AVATAR INITIALS
  // =========================================================

  get initials(): string {

    if (!this.currentUser?.fullName) {

      return '';
    }


    const parts =
      this.currentUser.fullName
        .trim()
        .split(/\s+/);


    if (parts.length === 1) {

      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }


    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }


  // =========================================================
  // ROLE LABEL
  // =========================================================

  get roleLabel(): string {

    switch (this.role) {

      case 'HR_ADMIN':
        return 'HR';

      case 'HR_MANAGER':
        return 'HR Manager';

      case 'LINE_MANAGER':
        return 'Manager';

      case 'EMPLOYEE':
      default:
        return 'Employee';
    }
  }
}