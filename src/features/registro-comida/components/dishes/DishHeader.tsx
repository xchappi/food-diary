import React from 'react';

interface DishHeaderProps {
  index: number;
  name?: string;
  onRemove: (index: number) => void;
  dragHandleProps?: any;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
}

/**
 * Componente presentacional para mostrar el encabezado de un plato
 * Incluye soporte para drag and drop y para expandir/colapsar
 */
const DishHeader: React.FC<DishHeaderProps> = ({ 
  index, 
  name,
  onRemove,
  dragHandleProps,
  onToggleExpand,
  isExpanded = true
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="cursor-move p-1 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Arrastrar para reordenar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        )}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Plato #{index + 1}{name ? `: ${name}` : ''}
        </h3>
      </div>

      <div className="flex items-center space-x-2">
        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title={isExpanded ? "Colapsar plato" : "Expandir plato"}
          >
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          title="Eliminar plato"
          aria-label="Eliminar plato"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DishHeader;