import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const currentUserJson =
    sessionStorage.getItem('currentUser');

  if (!currentUserJson) {
    return next(req);
  }

  try {

    const currentUser =
      JSON.parse(currentUserJson);

    const token =
      currentUser?.token;

    if (!token) {
      return next(req);
    }

    const authReq =
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

    return next(authReq);

  } catch (error) {

    console.error(
      '🔥 AUTH INTERCEPTOR ERROR:',
      error
    );

    return next(req);
  }
};