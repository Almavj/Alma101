import { createBrowserRouter } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth.new';
import Videos from './pages/Videos';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Tools from './pages/Tools';
import ToolDetail from './pages/ToolDetail';
import Writeup from './pages/Writeup';
import WriteupDetail from './pages/WriteupDetail';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import { ProtectedRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/auth',
    element: <ErrorBoundary><Auth /></ErrorBoundary>,
    errorElement: <ErrorBoundary><Auth /></ErrorBoundary>,
  },
  {
    path: '/reset-password',
    element: <ErrorBoundary><ResetPassword /></ErrorBoundary>,
  },
  {
    path: '/change-password',
    element: <ProtectedRoute><ChangePassword /></ProtectedRoute>,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
  {
    path: '/videos',
    element: <ProtectedRoute><Videos /></ProtectedRoute>,
  },
  {
    path: '/blogs',
    element: <ProtectedRoute><Blogs /></ProtectedRoute>,
  },
  {
    path: '/blogs/:id',
    element: <ProtectedRoute><BlogDetail /></ProtectedRoute>,
  },
  {
    path: '/tools',
    element: <ProtectedRoute><Tools /></ProtectedRoute>,
  },
  {
    path: '/tools/:id',
    element: <ProtectedRoute><ToolDetail /></ProtectedRoute>,
  },
  {
    path: '/writeup',
    element: <ProtectedRoute><Writeup /></ProtectedRoute>,
  },
  {
    path: '/writeup/:id',
    element: <ProtectedRoute><WriteupDetail /></ProtectedRoute>,
  },
  {
    path: '*',
    element: <NotFound />,
  },
], {
  future: {
    // Remove future flags as they're causing TypeScript errors
  }
});
