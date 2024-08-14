import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  try {
    const user = JSON.parse(localStorage.getItem('user') || '') || null;
    if(!user || !user?.id) {
      localStorage.clear();
      router.navigate(['/login']);
      return false;
    }

  } catch (error) {
    localStorage.clear();
    router.navigate(['/login']);
  }
  return true;
};
