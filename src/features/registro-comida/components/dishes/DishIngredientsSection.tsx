import React, { useState } from 'react';
import { IngredientsList, AddIngredientForm, type Ingredient } from '../ingredients';

interface DishIngredientsSectionProps {
  ingredients: Ingredient[];
  onRemoveIngredient: (index: number) => void;
  onAddIngredient: (ingredient: Ingredient) => void;
}

/**
 * Componente presentacional para la sección de ingredientes de un plato
 */
const DishIngredientsSection: React.FC<DishIngredientsSectionProps> = ({
  ingredients,
  onRemoveIngredient,
  onAddIngredient
}) => {
  // Estado local para el nuevo ingrediente
  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    name: '',
    possibleAllergen: false,
    allergenType: '',
    quantity: ''
  });

  // Manejar cambios en el formulario de ingredientes
  const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Para campos checkbox usamos el valor 'checked', para los demás el 'value'
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setNewIngredient(prev => ({
      ...prev,
      [name]: fieldValue
    }));
  };

  // Manejar la adición de un nuevo ingrediente
  const handleAddIngredient = () => {
    // Verificar que el ingrediente tenga al menos un nombre
    if (!newIngredient.name || newIngredient.name.trim() === '') return;
    
    // Llamar a la función del padre para añadir el ingrediente
    onAddIngredient(newIngredient);
    
    // Resetear el formulario
    setNewIngredient({
      name: '',
      possibleAllergen: false,
      allergenType: '',
      quantity: ''
    });
  };
  
  return (
    <div>
      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Ingredientes</h4>
      
      {/* Lista de ingredientes */}
      <div className="mb-4">
        <IngredientsList 
          ingredients={ingredients}
          onRemoveIngredient={onRemoveIngredient}
        />
      </div>
      
      {/* Formulario para añadir ingredientes manualmente */}
      <AddIngredientForm 
        newIngredient={newIngredient}
        onChange={handleIngredientChange}
        onAddIngredient={handleAddIngredient}
      />
    </div>
  );
};

export default DishIngredientsSection;