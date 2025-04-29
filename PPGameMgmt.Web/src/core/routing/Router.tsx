import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { useEffect } from 'react';
import { initializeRoutePreloading } from './preloadRoutes';

export const Router = () => {
  const router = createBrowserRouter(routes);
  
  // Initialize route preloading system
  useEffect(() => {
    initializeRoutePreloading();
  }, []);
  
  return <RouterProvider router={router} />;
};