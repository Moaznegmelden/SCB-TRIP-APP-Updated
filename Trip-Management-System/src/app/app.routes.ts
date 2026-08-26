import { Routes } from '@angular/router';

import { Login } from './pages/login/login';

import { EmployeeDashboard } from './pages/employee-dashboard/employee-dashboard';
import { Announcement } from './pages/announcement/announcement';
import { Application } from './pages/application/application';
import { Creation } from './pages/creation/creation';
import { FollowUp } from './pages/follow-up/follow-up';

import { HrApproval } from './pages/hr-approval/hr-approval';
import { HrApprovalDetails } from './pages/hr-approval-details/hr-approval-details';

import { History } from './pages/history/history';
import { MyRequests } from './pages/my-requests/my-requests';

import { Publish } from './pages/publish/publish';
import { Selection } from './pages/selection/selection';
import { TripDetails } from './pages/trip-details/trip-details';

import { AppApproval } from './pages/app-approval/app-approval';

import { lineManagerGuard } from './guards/line-manager.guard';
import { hrAdminGuard } from './guards/role.guard';
import { hrManagerGuard } from './guards/hr-manager.guard';


export const routes: Routes = [

  // =========================================================
  // LOGIN
  // =========================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },


  // =========================================================
  // COMMON EMPLOYEE SERVICES
  //
  // ALL FOUR ROLES CAN USE THESE
  //
  // EMPLOYEE
  // LINE_MANAGER
  // HR_ADMIN
  // HR_MANAGER
  // =========================================================

  {
    path: 'employee-dashboard',
    component: EmployeeDashboard
  },

  {
    path: 'trip-details',
    component: TripDetails
  },

  {
    path: 'application',
    component: Application
  },

  {
    path: 'my-requests',
    component: MyRequests
  },

  {
    path: 'history',
    component: History
  },

  {
    path: 'follow-up/:id',
    component: FollowUp
  },


  // =========================================================
  // LINE MANAGER
  // =========================================================

  // Manager Approval Tasks
  {
    path: 'manager-approval',
    component: AppApproval,
    canActivate: [lineManagerGuard]
  },

  // Manager Approval History
  {
    path: 'approval-history',
    loadComponent: () =>
      import('./pages/manager-history/manager-history')
        .then(m => m.ManagerHistory),

    canActivate: [lineManagerGuard]
  },


  // =========================================================
  // HR ADMIN
  // =========================================================

  // Create Trips
  {
    path: 'admin/trips/create',
    component: Creation,
    canActivate: [hrAdminGuard]
  },

  // HR Admin submits trip to HR Manager
  {
    path: 'admin/trips/publish',
    component: Publish,
    canActivate: [hrAdminGuard]
  },

  // HR Admin Selection Task
  {
    path: 'admin/trips/selection',
    component: Selection,
    canActivate: [hrAdminGuard]
  },


  // =========================================================
  // HR MANAGER
  // =========================================================

  // Trip Approval
  {
    path: 'admin/trips/approvals',
    component: HrApproval,
    canActivate: [hrManagerGuard]
  },

  // Trip Approval Details
  {
    path: 'admin/trips/approvals/:id',
    component: HrApprovalDetails,
    canActivate: [hrManagerGuard]
  },


  // =========================================================
  // ANNOUNCEMENT
  // =========================================================

  {
  path: 'admin/trips/announcement',
  loadComponent: () =>
    import('./pages/announcement/announcement')
      .then(m => m.Announcement)
},

{
  path: 'admin/trips/announcement/:tripId',
  loadComponent: () =>
    import('./pages/announcement/announcement')
      .then(m => m.Announcement)
},

];