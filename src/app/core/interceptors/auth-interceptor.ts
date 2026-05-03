import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/services',
    '/api/products',
    '/api/business-hours',
    '/api/availability'
  ];

  const isPublicEndpoint = publicEndpoints.some(endpoint =>
    req.url.includes(endpoint)
  );

  if (isPublicEndpoint) {
    return next(req);
  }

  const token = localStorage.getItem('accessToken');

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('accessToken');
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return true;
    }

    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    );

    if (!decodedPayload?.exp) {
      return false;
    }

    return Date.now() >= decodedPayload.exp * 1000;
  } catch {
    return true;
  }
}