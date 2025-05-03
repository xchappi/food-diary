import React from 'react';

interface DishBasicInfoProps {
  name: string;
  description: string;
  index: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAnalyzeDescription: () => void;
  isLoading: boolean;
}

/**
 * Componente presentacional para los campos básicos de un plato
 */
const DishBasicInfo: React.FC<DishBasicInfoProps> = ({ 
  name, 
  description, 
  index, 
  onChange, 
  onAnalyzeDescription, 
  isLoading 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`dish-name-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre del plato
        </label>
        <input
          type="text"
          id={`dish-name-${index}`}
          name="name"
          value={name}
          onChange={onChange}
          placeholder="Ej. Ensalada César"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
        />
      </div>
      
      <div>
        <label htmlFor={`dish-description-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descripción
        </label>
        <textarea
          id={`dish-description-${index}`}
          name="description"
          value={description}
          onChange={onChange}
          rows={2}
          placeholder="Describe el plato..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
        />
        
        <div className="mt-2">
          <button
            type="button"
            onClick={onAnalyzeDescription}
            disabled={!description || description.trim() === '' || isLoading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 disabled:opacity-50"
          >
            {isLoading ? 'Analizando...' : 'Extraer ingredientes de la descripción'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishBasicInfo;