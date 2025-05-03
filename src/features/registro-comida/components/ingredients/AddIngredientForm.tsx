import React from 'react';
import { type Ingredient } from './IngredientsList';

export const commonAllergens = [
  { value: 'gluten', label: 'Gluten' },
  { value: 'lactosa', label: 'Lactosa' },
  { value: 'frutos_secos', label: 'Frutos secos' },
  { value: 'huevo', label: 'Huevo' },
  { value: 'soja', label: 'Soja' },
  { value: 'pescado', label: 'Pescado' },
  { value: 'mariscos', label: 'Mariscos' },
  { value: 'apio', label: 'Apio' },
  { value: 'mostaza', label: 'Mostaza' },
  { value: 'sésamo', label: 'Sésamo' },
  { value: 'sulfitos', label: 'Sulfitos' },
  { value: 'altramuz', label: 'Altramuz' },
  { value: 'moluscos', label: 'Moluscos' },
  { value: 'ajo', label: 'Ajo' },
  { value: 'cebolla', label: 'Cebolla' }
];

interface AddIngredientFormProps {
  newIngredient: Ingredient;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAddIngredient: () => void;
}

const AddIngredientForm: React.FC<AddIngredientFormProps> = ({
  newIngredient,
  onChange,
  onAddIngredient
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Añadir ingrediente manualmente
      </h5>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-1">
          <input
            type="text"
            placeholder="Nombre del ingrediente"
            name="name"
            value={newIngredient.name}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
        
        <div className="md:col-span-1">
          <input
            type="text"
            placeholder="Cantidad (opcional)"
            name="quantity"
            value={newIngredient.quantity || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
        
        <div className="md:col-span-1">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="possibleAllergen"
              name="possibleAllergen"
              checked={newIngredient.possibleAllergen}
              onChange={onChange}
              className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="possibleAllergen" className="text-sm text-gray-700 dark:text-gray-300">
              Es alérgeno
            </label>
          </div>
        </div>
        
        <div className="md:col-span-1">
          {newIngredient.possibleAllergen && (
            <select
              name="allergenType"
              value={newIngredient.allergenType || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm dark:bg-gray-800 dark:text-white"
            >
              <option value="">Seleccionar tipo</option>
              {commonAllergens.map(allergen => (
                <option key={allergen.value} value={allergen.value}>
                  {allergen.label}
                </option>
              ))}
            </select>
          )}
          
          {!newIngredient.possibleAllergen && (
            <button
              type="button"
              onClick={onAddIngredient}
              disabled={!newIngredient.name}
              className="w-full px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Añadir
            </button>
          )}
        </div>
        
        {newIngredient.possibleAllergen && (
          <div className="md:col-span-4 flex justify-end">
            <button
              type="button"
              onClick={onAddIngredient}
              disabled={!newIngredient.name}
              className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Añadir ingrediente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddIngredientForm;