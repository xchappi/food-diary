import React from 'react';

export interface Ingredient {
  name: string;
  possibleAllergen: boolean;
  allergenType?: string | null;
  quantity?: string | null;
}

interface IngredientsListProps {
  ingredients: Ingredient[];
  onRemoveIngredient: (index: number) => void;
}

const IngredientsList: React.FC<IngredientsListProps> = ({ ingredients, onRemoveIngredient }) => {
  if (ingredients.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
        No hay ingredientes registrados. Añade ingredientes manualmente o extráelos automáticamente de la foto o descripción.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {ingredients.map((ingredient, index) => (
        <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="flex-grow">
            <div className="flex items-center">
              <span className="font-medium text-gray-900 dark:text-white">
                {ingredient.name}
              </span>
              {ingredient.possibleAllergen && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  {ingredient.allergenType || 'Posible alérgeno'}
                </span>
              )}
              {ingredient.quantity && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({ingredient.quantity})
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemoveIngredient(index)}
            className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default IngredientsList;