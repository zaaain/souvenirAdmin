import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthLayout from '@components/layouts/AuthLayout'
import DashboardLayout from '@components/layouts/DashboardLayout'
import Login from '@pages/auth/login'
import Register from '@pages/auth/register'
import ForgotPassword from '@pages/auth/forgot-password'
import OTP from '@pages/auth/otp'
import Dashboard from '@pages/dashboard/dashboard'
import Profile from '@pages/profile/profile'
import Settings from '@pages/settings/settings'
import NotFound from '@pages/404/NotFound'

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'otp',
        element: <OTP />,
      },
    ],
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

