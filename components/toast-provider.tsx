'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from 'next-themes';

export function ToastProvider() {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dark';

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={isDarkTheme ? 'dark' : 'light'}
    />
  );
} 