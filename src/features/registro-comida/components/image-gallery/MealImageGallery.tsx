import React from 'react';

export interface MealImage {
  id?: string;
  imageUrl: string;
  isMain: boolean;
  order: number;
}

interface MealImageGalleryProps {
  images: MealImage[];
  mainImageIndex: number;
  onSetMainImage: (index: number) => void;
  onMoveImageUp: (index: number) => void;
  onMoveImageDown: (index: number) => void;
  onRemoveImage: (index: number) => void;
}

const MealImageGallery: React.FC<MealImageGalleryProps> = ({
  images,
  mainImageIndex,
  onSetMainImage,
  onMoveImageUp,
  onMoveImageDown,
  onRemoveImage
}) => {
  if (images.length === 0) return null;

  return (
    <div className="mt-4">
      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Imágenes ({images.length})
      </h5>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`relative rounded-md overflow-hidden border-2 ${
              image.isMain ? 'border-primary-500' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <img 
              src={image.imageUrl} 
              alt={`Imagen ${index + 1}`} 
              className="w-full h-32 object-cover"
            />
            
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="flex space-x-1">
                {/* Botón para establecer como principal */}
                {!image.isMain && (
                  <button
                    type="button"
                    onClick={() => onSetMainImage(index)}
                    className="p-1 bg-primary-600 text-white rounded"
                    title="Establecer como imagen principal"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </button>
                )}
                
                {/* Botón para mover hacia arriba */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => onMoveImageUp(index)}
                    className="p-1 bg-gray-600 text-white rounded"
                    title="Mover hacia arriba"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                )}
                
                {/* Botón para mover hacia abajo */}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => onMoveImageDown(index)}
                    className="p-1 bg-gray-600 text-white rounded"
                    title="Mover hacia abajo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                
                {/* Botón para eliminar */}
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="p-1 bg-red-600 text-white rounded"
                  title="Eliminar imagen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Indicador de imagen principal */}
            {image.isMain && (
              <div className="absolute top-0 left-0 bg-primary-500 text-white text-xs px-2 py-1">
                Principal
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealImageGallery;