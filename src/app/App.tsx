import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from '../components/feedback/ToastProvider';
import { AuthProvider } from './providers/AuthProvider';
import { router } from './router';

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}
