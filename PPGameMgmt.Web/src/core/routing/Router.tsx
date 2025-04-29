import { useRoutes } from 'react-router-dom';
import { routes } from './routes';

export const Router = () => {
  const element = useRoutes(routes);
  return element;
};