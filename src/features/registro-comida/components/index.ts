// Exportar componentes para registro de comidas
import MealForm from './MealForm-v2';
import DishDetail from './DishDetail';
import DishesList from './DishesList';

// Re-exportar tipos
import { type Dish } from './dishes';

export {
  MealForm,
  DishDetail,
  DishesList,
};

export type {
  Dish
};