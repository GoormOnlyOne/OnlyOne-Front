import { createBrowserRouter } from 'react-router-dom';
import { Home } from '../pages/Home/Home.tsx';
import { ComponentGallery } from '../pages/ComponentGallery/ComponentGallery.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/components',
    element: <ComponentGallery />,
  },
]);