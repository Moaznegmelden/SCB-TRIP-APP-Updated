import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const lineManagerGuard: CanActivateFn = () => {

  const router = inject(Router);


  // =========================================================
  // CURRENT USER
  // =========================================================

  const currentUserJson =
    sessionStorage.getItem('currentUser');


  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!currentUserJson) {

    return router.createUrlTree([
      '/login'
    ]);
  }


  // =========================================================
  // CHECK ROLE
  // =========================================================

  try {

    const currentUser =
      JSON.parse(currentUserJson);

    console.log(
      '🔥 CURRENT USER IN LINE MANAGER GUARD:',
      currentUser
    );


    const role =
      currentUser?.role
        ?.toUpperCase()
        ?.trim();


    // =======================================================
    // LINE MANAGER ONLY
    // =======================================================

    if (role === 'LINE_MANAGER') {

      return true;
    }


    // =======================================================
    // WRONG ROLE
    // =======================================================

    return router.createUrlTree([
      '/employee-dashboard'
    ]);

  } catch (error) {

    console.error(
      '🔥 LINE MANAGER GUARD ERROR:',
      error
    );

    return router.createUrlTree([
      '/login'
    ]);
  }
};