import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import Layout from './components/Layout';
import AnnotateSample from './screens/AnnotateSample';

const router = createMemoryRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <AnnotateSample />
      },
    ]
  },
]);

const App = () => {
  return (
    <RouterProvider router={router} />
  );
}

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);