import React from 'react';
import DishForm, { type Dish } from './DishForm';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import BatchIngredientAdder from './BatchIngredientAdder';

interface EmptyDishesPlaceholderProps {
  onAddDish: () => void;
}

/**
 * Componente presentacional para mostrar cuando no hay platos
 */
const EmptyDishesPlaceholder: React.FC<EmptyDishesPlaceholderProps> = ({ onAddDish }) => (
  <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
    <p className="text-gray-500 dark:text-gray-400 mb-4">
      No hay platos añadidos. Haz clic en "Añadir Plato" para comenzar.
    </p>
    <button
    type="button"
    onClick={onAddDish}
    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      aria-label="Añadir plato"
      >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Añadir Plato
    </button>
  </div>
);

interface DishesHeaderProps {
  dishCount: number;
  onAddDish: () => void;
  onBatchAdd: () => void;
}

/**
 * Componente presentacional para el encabezado de la lista de platos
 */
const DishesHeader: React.FC<DishesHeaderProps> = ({ dishCount, onAddDish, onBatchAdd }) => (
  <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
      Platos ({dishCount})
    </h3>
    <div className="flex space-x-2">
      {dishCount > 0 && (
        <button
          type="button"
          onClick={onBatchAdd}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          aria-label="Añadir en lote"
          title="Añadir ingredientes a múltiples platos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Añadir ingredientes en lote
        </button>
      )}
      <button
        type="button"
        onClick={onAddDish}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        aria-label="Añadir plato"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Añadir Plato
      </button>
    </div>
  </div>
);

interface DishesListProps {
  dishes: Dish[];
  onUpdateDish: (index: number, updatedDish: Dish) => void;
  onRemoveDish: (index: number) => void;
  onAddDish: () => void;
  onReorderDishes?: (dishes: Dish[]) => void;
  isEditing?: boolean;
}

/**
 * Componente contenedor para la lista de platos
 * Sigue el patrón Container/Presentational dividiendo responsabilidades
 * Incluye funcionalidad de arrastrar y soltar para reordenar platos
 */
export default function DishesList({
  dishes,
  onUpdateDish,
  onRemoveDish,
  onAddDish,
  onReorderDishes,
  isEditing = false
}: DishesListProps) {
  const hasDishes = dishes.length > 0;

  // Controla el modal de edición en lote
  const [batchEditOpen, setBatchEditOpen] = React.useState(false);

  // Maneja el evento de fin de arrastre
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    if (result.destination.index === result.source.index) return;
    
    const reorderedDishes = Array.from(dishes);
    const [removed] = reorderedDishes.splice(result.source.index, 1);
    reorderedDishes.splice(result.destination.index, 0, removed);
    
    // Actualizar el orden de los platos
    const updatedDishes = reorderedDishes.map((dish, index) => ({
      ...dish,
      order: index
    }));
    
    // Notificar al componente padre del nuevo orden
    if (onReorderDishes) {
      onReorderDishes(updatedDishes);
    }
    
    toast.success('Plato reordenado con éxito', {
      icon: '🍽️',
      duration: 2000
    });
  };

  // Abre el modal de edición en lote
  const handleBatchAdd = () => {
    setBatchEditOpen(true);
  };

  // Cierra el modal de edición en lote
  const handleCloseBatchEdit = () => {
    setBatchEditOpen(false);
  };

  return (
    <div className="space-y-4">
      <DishesHeader 
        dishCount={dishes.length} 
        onAddDish={onAddDish} 
        onBatchAdd={handleBatchAdd}
      />

      {!hasDishes ? (
        <EmptyDishesPlaceholder onAddDish={onAddDish} />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dishes">
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {dishes.map((dish, index) => {
                  // Asegurar que cada plato tiene un id válido para drag & drop
                  const id = dish.id || `dish-${index}`;
                  return (
                  <Draggable 
                    key={id} 
                    draggableId={id} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? 'opacity-70' : ''}`}
                      >
                        <DishForm
                          dish={dish}
                          index={index}
                          onChange={onUpdateDish}
                          onRemove={onRemoveDish}
                          isEditing={isEditing}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Componente de edición por lotes (se implementará después) */}
      {batchEditOpen && (
        <BatchIngredientAdder
          dishes={dishes}
          onUpdateDish={onUpdateDish}
          onClose={handleCloseBatchEdit}
        />
      )}
    </div>
  );
}

// BatchIngredientAdder importado desde BatchIngredientAdder.tsx
