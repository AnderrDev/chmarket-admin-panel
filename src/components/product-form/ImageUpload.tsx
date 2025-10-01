// src/components/product-form/ImageUpload.tsx
import { removeImagesFromBucket, derivePathFromPublicUrl } from '@/lib/upload'

interface ImageUploadProps {
    productFiles: File[]
    existingImages: { url: string; alt?: string; path?: string }[]
    isEditing: boolean
    productId?: string
    onProductFiles: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemoveExistingImage: (index: number) => void
    onUpdateProduct?: (id: string, data: any) => Promise<void>
}

export default function ImageUpload({
    productFiles,
    existingImages,
    isEditing,
    productId,
    onProductFiles,
    onRemoveExistingImage,
    onUpdateProduct
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

            {productFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {productFiles.map((f, i) => (
                        <div key={i} className="border rounded p-2">
                            <img
                                src={URL.createObjectURL(f)}
                                alt=""
                                className="h-24 w-full object-cover rounded"
                            />
                        </div>
                    ))}
                </div>
            )}

            {existingImages && existingImages.length > 0 && (
                <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Imágenes existentes</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {existingImages.map((img, i) => {
                            const url = typeof img === 'string' ? img : img.url
                            const alt = typeof img === 'string' ? '' : (img.alt || '')
                            return (
                                <div key={i} className="border rounded p-2 relative">
                                    <img src={url} alt={alt} className="h-24 w-full object-cover rounded" />
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 bg-white/90 text-red-600 text-xs px-2 py-0.5 rounded shadow"
                                        onClick={() => handleRemoveExistingImage(i, img)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
