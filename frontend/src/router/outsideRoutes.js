import { lazy } from 'react';
export const outsideRoutes = [
  {
    path: '/',
    redirect: localStorage.getItem('user') ? 'home' : 'login',
    hidden: true,
  },
  {
    path: '/login',
    title: 'Login',
    meta: { title: '', roles: [] },
    component: lazy(() => import('@/pages/Login')),
  },
  {
    path: '/register',
    title: 'Register',
    meta: { title: '', roles: [] },
    component: lazy(() => import('@/pages/Register')),
  },
  {
    path: '/register-old',
    title: 'Register',
    meta: { title: '', roles: [] },
    component: lazy(() => import('@/pages/RegisterOld')),
  },
];
