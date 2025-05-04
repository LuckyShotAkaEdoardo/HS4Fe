import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Functional guard per proteggere rotte in Angular 19 standalone
 */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  if (token) return true;
  router.navigate(['/login']);
  return false;
};
