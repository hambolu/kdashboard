"use client";

import { Toaster } from 'react-hot-toast';

export const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        className: '',
        duration: 5000,
        style: {
          background: '#fff',
          color: '#363636',
        },
        // Custom success toast style
        success: {
          style: {
            background: '#36976C',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#36976C',
          },
        },
        // Custom error toast style
        error: {
          style: {
            background: '#ef4444',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },
      }}
    />
  );
};
