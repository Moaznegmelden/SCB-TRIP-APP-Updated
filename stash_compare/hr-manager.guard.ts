import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const hrManagerGuard: CanActivateFn = () => {

  const router = inject(Router);

  const currentUserJson =
    sessionStorage.getItem('currentUser');

  if (!currentUserJson) {
    return router.createUrlTree(['/login']);
  }

  try {

    const currentUser =
      JSON.parse(currentUserJson);

    const role =
      currentUser?.role
        ?.toUpperCase()
        ?.trim();

    if (role === 'HR_MANAGER') {
      return true;
    }

    return router.createUrlTree([
      '/employee-dashboard'
    ]);

  } catch (error) {

    console.error(
      '🔥 HR MANAGER GUARD ERROR:',
      error
    );

    return router.createUrlTree(['/login']);
  }
};