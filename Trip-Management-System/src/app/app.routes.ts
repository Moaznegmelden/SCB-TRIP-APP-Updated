import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { EmployeeDashboard } from './pages/employee-dashboard/employee-dashboard';
import { Announcement } from './pages/announcement/announcement';
import { Application } from './pages/application/application';
import { Creation } from './pages/creation/creation';
import { FollowUp } from './pages/follow-up/follow-up';
import { HrApproval } from './pages/hr-approval/hr-approval';
import { HrApprovalDetails } from './pages/hr-approval-details/hr-approval-details';
import { ManagerHistory } from './pages/manager-history/manager-history';
import { MyRequests } from './pages/my-requests/my-requests';
import { Publish } from './pages/publish/publish';
import { Selection } from './pages/selection/selection';
import { TripDetails } from './pages/trip-details/trip-details';

export const routes: Routes = [

  // =========================
  // LOGIN
  // =========================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },


  // =========================
  // EMPLOYEE
  // =========================

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
    path: 'follow-up/:id',
    component: FollowUp
  },


  // =========================
  // MANAGER
  // =========================

  {
    path: 'manager-history',
    component: ManagerHistory
  },


  // =========================
  // HR / ADMIN
  // =========================

  {
    path: 'admin/trips/create',
    component: Creation
  },

  {
    path: 'admin/trips/publish',
    component: Publish
  },

  {
    path: 'admin/trips/selection',
    component: Selection
  },

  {
    path: 'admin/trips/approvals',
    component: HrApproval
  },

  {
    path: 'admin/trips/approvals/:id',
    component: HrApprovalDetails
  },

  {
    path: 'announcement',
    component: Announcement
  }

];