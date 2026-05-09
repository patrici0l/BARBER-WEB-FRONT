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

  // Verificamos si la URL actual coincide con algún endpoint público
  const isPublicEndpoint = publicEndpoints.some(endpoint =>
    req.url.includes(endpoint)
  );

  if (isPublicEndpoint) {
    return next(req);
  }

  const token = localStorage.getItem('accessToken');

  // Si no hay token o está expirado, limpiamos sesión y dejamos pasar la petición 
  // (el backend responderá 401 si el recurso es protegido)
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser'); // Limpieza añadida
    return next(req);
  }

  // Clonamos la petición e inyectamos el header Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};

/**
 * Función auxiliar para decodificar el JWT y verificar su fecha de expiración
 */
function isTokenExpired(token: string): boolean {
  try {
    const payloadPart = token.split('.')[1];

    if (!payloadPart) {
      return true;
    }

    // Normalización de Base64 para caracteres especiales
    const normalizedPayload = payloadPart.replace(/-/g, '+').replace(/_/g, '/');

    // Decodificación manejando caracteres Unicode (UTF-8)
    const decodedPayload = JSON.parse(
      decodeURIComponent(
        atob(normalizedPayload)
          .split('')
          .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      )
    );

    if (!decodedPayload?.exp) {
      return false;
    }

    // Comparamos el tiempo actual con el de expiración (convertido a ms)
    return Date.now() >= decodedPayload.exp * 1000;
  } catch {
    return true;
  }
}