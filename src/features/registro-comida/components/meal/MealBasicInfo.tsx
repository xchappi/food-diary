import React from 'react';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'BRUNCH' | 'SUPPER';

interface MealBasicInfoProps {
  date: string;
  time: string;
  mealType: MealType;
  description: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

/**
 * Componente presentacional para la información básica de una comida
 * Encargado solo de renderizar la UI, sin lógica de negocio
 */
const MealBasicInfo: React.FC<MealBasicInfoProps> = ({
  date,
  time,
  mealType,
  description,
  onChange
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fecha
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={onChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Hora
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={time}
            onChange={onChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo de comida
        </label>
        <select
          id="mealType"
          name="mealType"
          value={mealType}
          onChange={onChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="BREAKFAST">Desayuno</option>
          <option value="LUNCH">Almuerzo</option>
          <option value="DINNER">Comida</option>
          <option value="SNACK">Snack</option>
          <option value="BRUNCH">Brunch</option>
          <option value="SUPPER">Cena</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descripción general de la comida
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={onChange}
          rows={2}
          placeholder="Descripción general opcional..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>
  );
};

export default MealBasicInfo;