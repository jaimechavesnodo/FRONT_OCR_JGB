import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        canActivate: [authGuard]
    },
    {
        path: 'establishment',
        loadComponent: () => import('./pages/establishment/establishment.component').then(m => m.EstablishmentComponent),
        canActivate: [authGuard]
    },
    {
        path: 'lottery',
        loadComponent: () => import('./pages/lottery/lottery.component').then(m => m.LotteryComponent),
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
