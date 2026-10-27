import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import { router } from './router';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in index.html');

createRoot(rootElement).render(
  <StrictMode>
    <StoreProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </StoreProvider>
  </StrictMode>,
);
