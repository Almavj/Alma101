import { createBrowserRouter } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Videos from './pages/Videos';
import Blogs from './pages/Blogs';
import Tools from './pages/Tools';
import Writeup from './pages/Writeup';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
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
    path: '/tools',
    element: <ProtectedRoute><Tools /></ProtectedRoute>,
  },
  {
    path: '/writeup',
    element: <ProtectedRoute><Writeup /></ProtectedRoute>,
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