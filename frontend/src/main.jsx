import { MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  </StrictMode>
);
