// src/components/product-form/VariantForm.tsx

interface VariantFormProps {
    variantForm: {
        sku: string
        label: string
        flavor: string
        size: string
        price_cents: string
        compare_at_price_cents: string
        in_stock: string
        low_stock_threshold: string
        is_default: boolean
        files: File[]
    }
    onVariantChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onFirstVariantFiles: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function VariantForm({
    variantForm,
    onVariantChange,
    onFirstVariantFiles
}: VariantFormProps) {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-6">Primera Variante</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-1">SKU *</label>
                    <input
                        className="input-field"
                        required
                        name="sku"
                        value={variantForm.sku}
                        onChange={onVariantChange}
                        placeholder="CREA-300"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Label *</label>
                    <input
                        className="input-field"
                        required
                        name="label"
                        value={variantForm.label}
                        onChange={onVariantChange}
                        placeholder="300g Vainilla"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Sabor</label>
                    <input
                        className="input-field"
                        name="flavor"
                        value={variantForm.flavor}
                        onChange={onVariantChange}
                        placeholder="Vainilla"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Tamaño</label>
                    <input
                        className="input-field"
                        name="size"
                        value={variantForm.size}
                        onChange={onVariantChange}
                        placeholder="300g"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Precio (centavos) *</label>
                    <input
                        className="input-field"
                        required
                        type="number"
                        name="price_cents"
                        value={variantForm.price_cents}
                        onChange={onVariantChange}
                        placeholder="49900"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Compare At</label>
                    <input
                        className="input-field"
                        type="number"
                        name="compare_at_price_cents"
                        value={variantForm.compare_at_price_cents}
                        onChange={onVariantChange}
                        placeholder="59900"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Stock *</label>
                    <input
                        className="input-field"
                        required
                        type="number"
                        name="in_stock"
                        value={variantForm.in_stock}
                        onChange={onVariantChange}
                        placeholder="25"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Low Stock *</label>
                    <input
                        className="input-field"
                        required
                        type="number"
                        name="low_stock_threshold"
                        value={variantForm.low_stock_threshold}
                        onChange={onVariantChange}
                        placeholder="5"
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1">Imágenes de la variante</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onFirstVariantFiles}
                    />
                    {variantForm.files.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {variantForm.files.map((f, i) => (
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
                </div>
            </div>
        </div>
    )
}
