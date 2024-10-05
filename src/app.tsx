import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import Layout from './components/Layout';
import AnnotateSample from './screens/AnnotateSample';
import SelectDataset from './screens/SelectDataset';

const router = createMemoryRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path: '/',
          element: <SelectDataset />
        },
        {
          path: '/annotate/:datasetName',
          element: <AnnotateSample />
        },
      ],
    },
  ],
  {
    initialEntries: ['/annotate/my_test_dataset'], // Start at this route for testing
  }
);

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