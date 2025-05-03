import React, { useState } from 'react';
import { DishesList, type Dish } from './dishes';
import { MealBasicInfo, FormActions, ErrorMessage } from './meal';
import { NutritionSummary } from './dishes';
import { BatchIngredientAdder } from './dishes';
import { toast } from 'react-hot-toast';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'BRUNCH' | 'SUPPER';

type MealFormProps = {
  initialData?: {
    id?: string;
    date?: string;
    time?: string;
    mealType?: MealType;
    description?: string;
    dishes?: Dish[];
  };
  isEditing?: boolean;
};

/**
 * Componente contenedor para el formulario de comida
 * Implementa el patrón Container/Presentational
 * El contenedor maneja la lógica y estado mientras que los componentes
 * presentacionales (hijos) solo se encargan de la UI
 */
export default function MealForm({ initialData = {}, isEditing = false }: MealFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5);

  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    date: initialData.date || today,
    time: initialData.time || now,
    mealType: initialData.mealType || 'BREAKFAST',
    description: initialData.description || '',
  });

  // Estado para los platos
  const [dishes, setDishes] = useState<Dish[]>(initialData.dishes || []);
  
  // Estado para manejo de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBatchEdit, setShowBatchEdit] = useState(false);

  /**
   * Maneja cambios en los campos básicos del formulario
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Maneja la actualización de un plato
   */
  const handleUpdateDish = (index: number, updatedDish: Dish) => {
    setDishes(prev => {
      const newDishes = [...prev];
      newDishes[index] = updatedDish;
      return newDishes;
    });
  };

  /**
   * Maneja la eliminación de un plato
   */
  const handleRemoveDish = (index: number) => {
    setDishes(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Añade un nuevo plato
   */
  const handleAddDish = () => {
    // Generar un ID único temporal para el plato
    const tempId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    setDishes(prev => [...prev, {
      id: tempId,
      name: `Plato ${prev.length + 1}`,
      description: '',
      order: prev.length,
      ingredients: []
    }]);
    
    toast.success('Nuevo plato añadido');
  };
  
  /**
   * Maneja el reordenamiento de platos mediante drag & drop
   */
  const handleReorderDishes = (reorderedDishes: Dish[]) => {
    setDishes(reorderedDishes);
  };
  
  /**
   * Abre el modal de edición por lotes
   */
  const handleOpenBatchEdit = () => {
    if (dishes.length === 0) {
      toast.error('Añade al menos un plato primero');
      return;
    }
    
    setShowBatchEdit(true);
  };
  
  /**
   * Cierra el modal de edición por lotes
   */
  const handleCloseBatchEdit = () => {
    setShowBatchEdit(false);
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (dishes.length === 0) {
      setError('Debes añadir al menos un plato a la comida');
      toast.error('Debes añadir al menos un plato a la comida');
      return;
    }
    
    // Validar nombres de platos
    const dishesWithoutName = dishes.filter(dish => !dish.name || dish.name.trim() === '');
    if (dishesWithoutName.length > 0) {
      setError(`Hay ${dishesWithoutName.length} plato(s) sin nombre`);
      toast.error(`Hay ${dishesWithoutName.length} plato(s) sin nombre`);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Procesar los platos
      const processedDishes = dishes.map((dish, i) => {
        // Asegurarse de que todos los campos obligatorios estén presentes
        const processedNutritionalData = dish.nutritionalData 
          ? {
              calories: parseFloat(dish.nutritionalData.calories) || 0,
              proteins: parseFloat(dish.nutritionalData.proteins) || 0,
              carbohydrates: parseFloat(dish.nutritionalData.carbohydrates) || 0,
              fats: parseFloat(dish.nutritionalData.fats) || 0,
              // Campos opcionales
              fiber: dish.nutritionalData.fiber ? parseFloat(dish.nutritionalData.fiber) : null,
              sugars: dish.nutritionalData.sugars ? parseFloat(dish.nutritionalData.sugars) : null,
              sodium: dish.nutritionalData.sodium ? parseFloat(dish.nutritionalData.sodium) : null,
              accuracy: dish.nutritionalData.accuracy || 70
            }
          : null;
        
        // Procesar los ingredientes para asegurar que tienen el formato correcto
        const processedIngredients = dish.ingredients ? dish.ingredients.map(ingredient => ({
          name: ingredient.name.trim().toLowerCase(),
          possibleAllergen: !!ingredient.possibleAllergen,
          allergenType: ingredient.possibleAllergen ? ingredient.allergenType : null,
          quantity: ingredient.quantity || null
        })) : [];
        
        return {
          id: dish.id,
          name: dish.name.trim(),
          description: dish.description ? dish.description.trim() : null,
          order: i,
          ingredients: processedIngredients,
          nutritionalData: processedNutritionalData
        };
      });
      
      // Construir payload completo
      const payload = {
        ...formData,
        dishes: processedDishes
      };
      
      const endpoint = isEditing 
        ? `/api/meals/${initialData.id}` 
        : '/api/meals';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // Enviar datos al servidor
      toast.loading('Guardando comida...', { id: 'save-meal' });
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al guardar la comida: ${errorText}`);
      }
      
      const data = await response.json();
      
      toast.success('Comida guardada con éxito', { id: 'save-meal' });
      
      // Redirigir a la página de detalle de la comida
      const redirectUrl = `/meals/${data.id}-v2`;
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Error en el proceso de guardado:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al guardar la comida: ${errorMessage}`);
      toast.error(`Error: ${errorMessage}`, { id: 'save-meal' });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mensaje de error */}
      <ErrorMessage message={error} />
      
      {/* Información básica de la comida */}
      <MealBasicInfo 
        date={formData.date}
        time={formData.time}
        mealType={formData.mealType as MealType}
        description={formData.description}
        onChange={handleChange}
      />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        {/* Lista de platos */}
        <DishesList 
          dishes={dishes}
          onUpdateDish={handleUpdateDish}
          onRemoveDish={handleRemoveDish}
          onAddDish={handleAddDish}
          onReorderDishes={handleReorderDishes}
          isEditing={isEditing}
        />
        
        {/* Resumen nutricional */}
        {dishes.length > 0 && dishes.some(dish => dish.nutritionalData) && (
          <div className="mt-8">
            <NutritionSummary dishes={dishes} />
          </div>
        )}
      </div>
      
      {/* Botones de acción */}
      <FormActions 
        isLoading={isLoading}
        isEditing={isEditing}
        mealId={initialData.id}
      />
      
      {/* Modal de edición por lotes */}
      {showBatchEdit && (
        <BatchIngredientAdder
          dishes={dishes}
          onUpdateDish={handleUpdateDish}
          onClose={handleCloseBatchEdit}
        />
      )}
    </form>
  );
}