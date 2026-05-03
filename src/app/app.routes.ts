import { Routes } from '@angular/router';

import { Home } from './features/home/home/home';
import { ProductList } from './features/products/product-list/product-list';
import { ServiceList } from './features/services/service-list/service-list';
import { AppointmentCreate } from './features/appointments/appointment-create/appointment-create';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'productos',
        component: ProductList
    },
    {
        path: 'servicios',
        component: ServiceList
    },
    {
        path: 'reservar',
        component: AppointmentCreate
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'registro',
        component: Register
    },
    {
        path: 'admin',
        component: AdminDashboard
    },
    {
        path: '**',
        redirectTo: ''
    }
];