import React from 'react';

interface FormActionsProps {
  isLoading: boolean;
  isEditing: boolean;
  mealId?: string;
}

/**
 * Componente presentacional para los botones de acción del formulario
 */
const FormActions: React.FC<FormActionsProps> = ({ isLoading, isEditing, mealId }) => {
  return (
    <div className="flex justify-end space-x-3">
      <a
        href={isEditing ? `/meals/${mealId}-v2` : '/dashboard'}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        Cancelar
      </a>
      
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
          </span>
        ) : (
          'Guardar'
        )}
      </button>
    </div>
  );
};

export default FormActions;