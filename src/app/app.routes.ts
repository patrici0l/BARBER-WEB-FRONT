import { Routes } from '@angular/router';

import { Home } from './features/home/home/home';
import { ProductList } from './features/products/product-list/product-list';
import { ServiceList } from './features/services/service-list/service-list';
import { AppointmentCreate } from './features/appointments/appointment-create/appointment-create';
import { MyAppointments } from './features/appointments/my-appointments/my-appointments';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { AdminServices } from './features/admin/admin-services/admin-services';
import { AdminProducts } from './features/admin/admin-products/admin-products';
import { AdminBusinessHours } from './features/admin/admin-business-hours/admin-business-hours';
import { AdminNotifications } from './features/admin/admin-notifications/admin-notifications';

import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

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
        path: 'mis-reservas',
        component: MyAppointments,
        canActivate: [authGuard]
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
        component: AdminDashboard,
        canActivate: [adminGuard]
    },
    {
        path: 'admin/servicios',
        component: AdminServices,
        canActivate: [adminGuard]
    },
    {
        path: 'admin/productos',
        component: AdminProducts,
        canActivate: [adminGuard]
    },
    {
        path: 'admin/horarios',
        component: AdminBusinessHours,
        canActivate: [adminGuard]
    },
    {
        path: 'admin/notificaciones',
        component: AdminNotifications,
        canActivate: [adminGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
