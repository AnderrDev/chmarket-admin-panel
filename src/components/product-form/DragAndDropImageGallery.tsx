// src/components/product-form/DragAndDropImageGallery.tsx
import { useState } from 'react';

interface ImageItem {
  id: string;
  url: string;
  alt?: string;
  path?: string;
  isNew?: boolean;
  file?: File;
}

interface DragAndDropImageGalleryProps {
  images: ImageItem[];
  onReorder: (reorderedImages: ImageItem[]) => void;
  onRemove: (index: number) => void;
  title?: string;
  showRemoveButton?: boolean;
}

export default function DragAndDropImageGallery({
  images,
  onReorder,
  onRemove,
  title = "Imágenes",
  showRemoveButton = true
}: DragAndDropImageGalleryProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    
    // Remove the dragged item from its original position
    newImages.splice(draggedIndex, 1);
    
    // Insert it at the new position
    newImages.splice(dropIndex, 0, draggedItem);
    
    onReorder(newImages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-sm font-medium mb-2">{title}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((img, index) => (
          <div
            key={img.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              border rounded p-2 relative cursor-move transition-all duration-200
              ${draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'}
              ${images.length > 1 ? 'hover:border-blue-300' : ''}
            `}
            style={{
              transform: draggedIndex === index ? 'rotate(5deg)' : 'none',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 font-medium">
                #{index + 1}
              </span>
              {images.length > 1 && (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              )}
            </div>
            
            <img
              src={img.url}
              alt={img.alt || ''}
              className="h-24 w-full object-cover rounded"
            />
            
            {showRemoveButton && (
              <button
                type="button"
                className="absolute top-2 right-2 bg-white/90 text-red-600 text-xs px-2 py-0.5 rounded shadow hover:bg-red-50"
                onClick={() => onRemove(index)}
                title="Eliminar imagen"
              >
                ✕
              </button>
            )}
            
            {images.length > 1 && (
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                Arrastra para reordenar
              </div>
            )}
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <p className="mt-2 text-xs text-gray-600">
          💡 Arrastra y suelta las imágenes para cambiar su orden
        </p>
      )}
    </div>
  );
}


