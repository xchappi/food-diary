import React from 'react';

interface ErrorMessageProps {
  message: string | null;
}

/**
 * Componente presentacional para mostrar mensajes de error
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-800 dark:text-red-300">
      {message}
    </div>
  );
};

export default ErrorMessage;