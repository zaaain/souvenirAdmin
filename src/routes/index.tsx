import { createBrowserRouter } from 'react-router-dom'
import AuthLayout from '@components/layouts/AuthLayout'
import DashboardLayout from '@components/layouts/DashboardLayout'
import Login from '@pages/auth/login'
import Register from '@pages/auth/register'
import ForgotPassword from '@pages/auth/forgot-password'
import OTP from '@pages/auth/otp'
import Dashboard from '@pages/dashboard/dashboard'
import Profile from '@pages/profile/profile'
import Settings from '@pages/settings/settings'
import Products from '@pages/products/products'
import ProductDetail from '@pages/products/ProductDetail'
import Vendors from '@pages/vendors/vendors'
import VendorDetail from '@pages/vendors/VendorDetail'
import Categories from '@pages/categories/categories'
import AddCategory from '@pages/categories/AddCategory'
import Users from '@pages/users/users'
import UserDetail from '@pages/users/UserDetail'
import Orders from '@pages/orders/orders'
import OrderDetail from '@pages/orders/OrderDetail'
import EarningPayout from '@pages/earning-payout/earningPayout'
import Team from '@pages/team/team'
import TeamDetail from '@pages/team/TeamDetail'
import AddAdmin from '@pages/team/AddAdmin'
import NotFound from '@pages/404/NotFound'

export const router = createBrowserRouter(
  [
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
        path: 'products/:id',
        element: <ProductDetail />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'vendors/:id',
        element: <VendorDetail />,
      },
      {
        path: 'vendors',
        element: <Vendors />,
      },
      {
        path: 'categories/add',
        element: <AddCategory />,
      },
      {
        path: 'categories',
        element: <Categories />,
      },
      {
        path: 'users/:id',
        element: <UserDetail />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'orders/:id',
        element: <OrderDetail />,
      },
      {
        path: 'orders',
        element: <Orders />,
      },
      {
        path: 'earning-payout',
        element: <EarningPayout />,
      },
      {
        path: 'team/add',
        element: <AddAdmin />,
      },
      {
        path: 'team/:id',
        element: <TeamDetail />,
      },
      {
        path: 'team',
        element: <Team />,
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
  ],
  { basename: import.meta.env.BASE_URL }
)

