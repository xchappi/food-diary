import React, { useState } from 'react';
import { type Dish } from './DishForm';
import DishCard from './DishCard';
import { AddIngredientForm, type Ingredient } from '../ingredients';
import { toast } from 'react-hot-toast';

interface BatchIngredientAdderProps {
  dishes: Dish[];
  onUpdateDish: (index: number, updatedDish: Dish) => void;
  onClose: () => void;
}

/**
 * Componente modal para añadir ingredientes a múltiples platos simultáneamente
 */
const BatchIngredientAdder: React.FC<BatchIngredientAdderProps> = ({
  dishes,
  onUpdateDish,
  onClose
}) => {
  // Estado para platos seleccionados
  const [selectedDishIndexes, setSelectedDishIndexes] = useState<number[]>([]);
  
  // Estado para nuevo ingrediente
  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    name: '',
    possibleAllergen: false,
    allergenType: '',
    quantity: ''
  });
  
  // Maneja los cambios en el formulario de ingredientes
  const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setNewIngredient(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Alternar selección de plato
  const toggleDishSelection = (index: number) => {
    setSelectedDishIndexes(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  // Seleccionar todos los platos
  const selectAllDishes = () => {
    if (selectedDishIndexes.length === dishes.length) {
      setSelectedDishIndexes([]);
    } else {
      setSelectedDishIndexes(dishes.map((_, index) => index));
    }
  };
  
  // Añadir ingrediente a todos los platos seleccionados
  const handleAddIngredientToDishes = () => {
    // Validar que el ingrediente tenga nombre
    if (!newIngredient.name || newIngredient.name.trim() === '') {
      toast.error('El ingrediente debe tener un nombre');
      return;
    }
    
    // Validar que haya platos seleccionados
    if (selectedDishIndexes.length === 0) {
      toast.error('Selecciona al menos un plato');
      return;
    }
    
    // Añadir ingrediente a cada plato seleccionado
    selectedDishIndexes.forEach(dishIndex => {
      const dish = dishes[dishIndex];
      
      // Verificar si el ingrediente ya existe en el plato
      const ingredientExists = dish.ingredients?.some(
        ing => ing.name.toLowerCase() === newIngredient.name.toLowerCase()
      );
      
      if (ingredientExists) {
        toast.error(`"${newIngredient.name}" ya existe en ${dish.name}`);
        return;
      }
      
      // Añadir ingrediente
      const updatedDish = {
        ...dish,
        ingredients: [...(dish.ingredients || []), newIngredient]
      };
      
      onUpdateDish(dishIndex, updatedDish);
    });
    
    toast.success(`Ingrediente añadido a ${selectedDishIndexes.length} platos`);
    
    // Reiniciar formulario
    setNewIngredient({
      name: '',
      possibleAllergen: false,
      allergenType: '',
      quantity: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Añadir ingrediente a múltiples platos
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Contenido */}
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium text-gray-900 dark:text-white">
                Selecciona los platos
              </h3>
              <button
                type="button"
                onClick={selectAllDishes}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {selectedDishIndexes.length === dishes.length 
                  ? 'Deseleccionar todos' 
                  : 'Seleccionar todos'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dishes.map((dish, index) => (
                <DishCard
                  key={dish.id || index}
                  dish={dish}
                  index={index}
                  selected={selectedDishIndexes.includes(index)}
                  onClick={() => toggleDishSelection(index)}
                />
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Ingrediente a añadir
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ingredient-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del ingrediente
                  </label>
                  <input
                    type="text"
                    id="ingredient-name"
                    name="name"
                    value={newIngredient.name}
                    onChange={handleIngredientChange}
                    placeholder="Ej. Tomate"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="ingredient-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cantidad (opcional)
                  </label>
                  <input
                    type="text"
                    id="ingredient-quantity"
                    name="quantity"
                    value={newIngredient.quantity}
                    onChange={handleIngredientChange}
                    placeholder="Ej. 2 cucharadas"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="possibleAllergen"
                    name="possibleAllergen"
                    checked={newIngredient.possibleAllergen}
                    onChange={handleIngredientChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                  />
                  <label htmlFor="possibleAllergen" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Es un alérgeno común
                  </label>
                </div>
                
                {newIngredient.possibleAllergen && (
                  <div className="mt-2">
                    <label htmlFor="allergenType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de alérgeno
                    </label>
                    <select
                      id="allergenType"
                      name="allergenType"
                      value={newIngredient.allergenType}
                      onChange={handleIngredientChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Selecciona un tipo</option>
                      <option value="gluten">Gluten</option>
                      <option value="lacteos">Lácteos</option>
                      <option value="frutos_secos">Frutos secos</option>
                      <option value="mariscos">Mariscos/Pescado</option>
                      <option value="huevo">Huevo</option>
                      <option value="soja">Soja</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            {selectedDishIndexes.length} platos seleccionados
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAddIngredientToDishes}
              disabled={!newIngredient.name || selectedDishIndexes.length === 0}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed rounded-md text-sm font-medium text-white"
            >
              Añadir a los platos seleccionados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchIngredientAdder;