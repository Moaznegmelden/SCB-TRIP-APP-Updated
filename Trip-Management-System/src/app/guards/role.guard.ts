import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const hrAdminGuard: CanActivateFn = () => {

  const router = inject(Router);

  const currentUserJson =
    sessionStorage.getItem('currentUser');

  if (!currentUserJson) {
    return router.createUrlTree(['/login']);
  }

  try {

    const currentUser = JSON.parse(currentUserJson);

    if (
      currentUser?.role
        ?.toUpperCase()
        ?.trim() === 'HR_ADMIN'
    ) {
      return true;
    }

    return router.createUrlTree(['/employee-dashboard']);

  } catch (error) {

    console.error(
      '🔥 HR ADMIN GUARD ERROR:',
      error
    );

    return router.createUrlTree(['/login']);
  }
};