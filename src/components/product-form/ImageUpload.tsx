// src/components/product-form/ImageUpload.tsx
import { removeImagesFromBucket, derivePathFromPublicUrl } from '@/lib/upload'
import DragAndDropImageGallery from './DragAndDropImageGallery'

interface ImageUploadProps {
    productFiles: File[]
    existingImages: { url: string; alt?: string; path?: string }[]
    isEditing: boolean
    productId?: string
    onProductFiles: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemoveExistingImage: (index: number) => void
    onUpdateProduct?: (id: string, data: any) => Promise<void>
    onReorderProductImages?: (reorderedFiles: File[]) => void
    onReorderExistingImages?: (reorderedImages: { url: string; alt?: string; path?: string }[]) => void
}

export default function ImageUpload({
    productFiles,
    existingImages,
    isEditing,
    productId,
    onProductFiles,
    onRemoveExistingImage,
    onUpdateProduct,
    onReorderProductImages,
    onReorderExistingImages
}: ImageUploadProps) {
    const handleRemoveExistingImage = async (index: number, img: any) => {
        try {
            const url = typeof img === 'string' ? img : img.url
            const path = typeof img === 'string'
                ? derivePathFromPublicUrl(url)
                : img.path || derivePathFromPublicUrl(url)

            if (path) await removeImagesFromBucket([path])

            onRemoveExistingImage(index)

            if (isEditing && productId && onUpdateProduct) {
                const updatedImages = [...existingImages]
                updatedImages.splice(index, 1)
                await onUpdateProduct(productId, { images: updatedImages })
            }
        } catch {
            // Error handling is done in the parent component
        }
    }

    return (
        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Imágenes del producto
            </label>
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={onProductFiles}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
            />

            {/* New Product Images */}
            {productFiles.length > 0 && (
                <DragAndDropImageGallery
                    images={productFiles.map((file, index) => ({
                        id: `new-${index}`,
                        url: URL.createObjectURL(file),
                        alt: '',
                        isNew: true,
                        file: file
                    }))}
                    onReorder={(reorderedImages) => {
                        if (onReorderProductImages) {
                            const reorderedFiles = reorderedImages.map(img => img.file!);
                            onReorderProductImages(reorderedFiles);
                        }
                    }}
                    onRemove={(index) => {
                        // Remove from productFiles array
                        const newFiles = productFiles.filter((_, i) => i !== index);
                        if (onReorderProductImages) {
                            onReorderProductImages(newFiles);
                        }
                    }}
                    title="Nuevas imágenes del producto"
                    showRemoveButton={true}
                />
            )}

            {/* Existing Product Images */}
            {existingImages && existingImages.length > 0 && (
                <DragAndDropImageGallery
                    images={existingImages.map((img, index) => ({
                        id: `existing-${index}`,
                        url: typeof img === 'string' ? img : img.url,
                        alt: typeof img === 'string' ? '' : (img.alt || ''),
                        path: typeof img === 'string' ? undefined : img.path
                    }))}
                    onReorder={(reorderedImages) => {
                        if (onReorderExistingImages) {
                            const reorderedExistingImages = reorderedImages.map(img => ({
                                url: img.url,
                                alt: img.alt,
                                path: img.path
                            }));
                            onReorderExistingImages(reorderedExistingImages);
                        }
                    }}
                    onRemove={(index) => handleRemoveExistingImage(index, existingImages[index])}
                    title="Imágenes existentes"
                    showRemoveButton={true}
                />
            )}
        </div>
    )
}
