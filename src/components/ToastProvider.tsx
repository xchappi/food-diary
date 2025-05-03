import React from 'react';
import { Toaster } from 'react-hot-toast';

/**
 * Componente para proporcionar notificaciones Toast a toda la aplicación
 */
const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Estilo por defecto para todos los toasts
        style: {
          background: 'var(--toast-bg, #fff)',
          color: 'var(--toast-color, #000)',
          border: '1px solid var(--toast-border, #e2e8f0)',
        },
        // Duración por defecto
        duration: 3000,
        // Configuración para cada tipo de toast
        success: {
          duration: 3000,
          style: {
            background: 'var(--toast-success-bg, #ecfdf5)',
            color: 'var(--toast-success-color, #065f46)',
            border: '1px solid var(--toast-success-border, #d1fae5)',
          },
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: 'var(--toast-error-bg, #fef2f2)',
            color: 'var(--toast-error-color, #991b1b)',
            border: '1px solid var(--toast-error-border, #fee2e2)',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
        loading: {
          duration: Infinity,
          style: {
            background: 'var(--toast-loading-bg, #f3f4f6)',
            color: 'var(--toast-loading-color, #1f2937)',
            border: '1px solid var(--toast-loading-border, #e5e7eb)',
          },
        },
      }}
    />
  );
};

export default ToastProvider;