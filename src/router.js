import {
  createBrowserRouter,
  Outlet,
  useLocation,
} from 'react-router-dom';

import { useMemo } from 'react';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GameDetail from './pages/GameDetail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Config from './pages/Config';

import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Orders from './pages/Orders';

import AdminCreateGame from './pages/AdminCreateGame';
import AdminEditGame from './pages/AdminEditGame';
import AdminGameList from './pages/AdminGameList';

import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// ✅ Wrapper per forzare il remount di Home
function HomeWrapper() {
  const location = useLocation();
  const key = useMemo(() => {
    return location.state?.resetPage ? Date.now() : 'default';
  }, [location.state?.resetPage]);

  return <Home key={key} />;
}

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: '', element: <HomeWrapper /> }, // ✅ Usiamo il wrapper
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: 'games/:id', element: <GameDetail /> },
        { path: 'forgot-password', element: <ForgotPassword /> },
        { path: 'reset-password', element: <ResetPassword /> },
        { path: 'verify-email', element: <VerifyEmail /> },

        {
          path: 'config',
          element: (
            <PrivateRoute>
              <Config />
            </PrivateRoute>
          ),
        },
        {
          path: 'cart',
          element: (
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          ),
        },
        {
          path: 'checkout',
          element: (
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          ),
        },
        {
          path: 'success',
          element: (
            <PrivateRoute>
              <Success />
            </PrivateRoute>
          ),
        },
        {
          path: 'cancel',
          element: (
            <PrivateRoute>
              <Cancel />
            </PrivateRoute>
          ),
        },
        {
          path: 'orders',
          element: (
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          ),
        },
        {
          path: 'admin/create-game',
          element: (
            <AdminRoute>
              <AdminCreateGame />
            </AdminRoute>
          ),
        },
        {
          path: 'admin/edit-game/:id',
          element: (
            <AdminRoute>
              <AdminEditGame />
            </AdminRoute>
          ),
        },
        {
          path: 'admin/games',
          element: (
            <AdminRoute>
              <AdminGameList />
            </AdminRoute>
          ),
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export default router;

  