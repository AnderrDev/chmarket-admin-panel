// src/components/product-form/BasicProductInfo.tsx
import { Category } from '@/types'
import { useAutoResize } from '@/hooks/useAutoResize'

interface BasicProductInfoProps {
    formData: {
        name: string
        slug: string
        category_id: string
        description: string
        long_description: string
        is_featured: boolean
        is_active: boolean
    }
    categories: Category[]
    categoriesLoading: boolean
    onProductChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
    setTouchedSlug: (touched: boolean) => void
}

export default function BasicProductInfo({
    formData,
    categories,
    categoriesLoading,
    onProductChange,
    setTouchedSlug
}: BasicProductInfoProps) {
    const { textareaRef: descriptionRef, handleInput: handleDescriptionInput } = useAutoResize()
    const { textareaRef: longDescriptionRef, handleInput: handleLongDescriptionInput } = useAutoResize()

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTouchedSlug(true)
        onProductChange(e)
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleDescriptionInput(e)
        onProductChange(e)
    }

    const handleLongDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleLongDescriptionInput(e)
        onProductChange(e)
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                    <input
                        className="input-field"
                        name="name"
                        required
                        value={formData.name}
                        onChange={onProductChange}
                        placeholder="Creatina CH+"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Slug *</label>
                    <input
                        className="input-field"
                        name="slug"
                        required
                        value={formData.slug}
                        onChange={handleSlugChange}
                        placeholder="creatina-ch"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Categoría *</label>
                    <select
                        name="category_id"
                        required
                        value={formData.category_id}
                        onChange={onProductChange}
                        className="input-field"
                        disabled={categoriesLoading}
                    >
                        <option value="">{categoriesLoading ? 'Cargando…' : 'Selecciona…'}</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={onProductChange}
                            className="h-4 w-4"
                        />
                        <span className="ml-2 text-sm">Activo</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={onProductChange}
                            className="h-4 w-4"
                        />
                        <span className="ml-2 text-sm">Destacado</span>
                    </label>
                </div>
            </div>

            {/* Descripciones */}
            <div className="mt-6">
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                    ref={descriptionRef}
                    className="input-field resize-none overflow-hidden"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Descripción corta del producto..."
                />
            </div>
            <div className="mt-6">
                <label className="block text-sm font-medium mb-1">Descripción Larga</label>
                <textarea
                    ref={longDescriptionRef}
                    className="input-field resize-none overflow-hidden"
                    rows={5}
                    name="long_description"
                    value={formData.long_description}
                    onChange={handleLongDescriptionChange}
                    placeholder="Descripción detallada del producto, beneficios, modo de uso..."
                />
            </div>
        </div>
    )
}
