// src/components/product-form/NutritionFacts.tsx

interface NutritionFactsProps {
    nutritionFacts: {
        serving_size: string
        servings_per_container: string
        notes: string
        allergens: string[]
        nutrients: { name: string; amount: string; unit: string; }[]
    }
    onNutritionFactsChange: (nutritionFacts: any) => void
}

export default function NutritionFacts({
    nutritionFacts,
    onNutritionFactsChange
}: NutritionFactsProps) {
    const handleNutrientChange = (index: number, field: string, value: string) => {
        const arr = [...nutritionFacts.nutrients]
        arr[index] = { ...arr[index], [field]: value }
        onNutritionFactsChange({ ...nutritionFacts, nutrients: arr })
    }

    const removeNutrient = (index: number) => {
        const arr = [...nutritionFacts.nutrients]
        arr.splice(index, 1)
        onNutritionFactsChange({ ...nutritionFacts, nutrients: arr })
    }

    const addNutrient = () => {
        onNutritionFactsChange({
            ...nutritionFacts,
            nutrients: [...nutritionFacts.nutrients, { name: '', amount: '', unit: '' }]
        })
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Información Nutricional</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Tamaño por porción</label>
                    <input
                        className="input-field"
                        value={nutritionFacts.serving_size}
                        onChange={(e) => onNutritionFactsChange({ ...nutritionFacts, serving_size: e.target.value })}
                        placeholder="30 g"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Porciones por envase</label>
                    <input
                        className="input-field"
                        value={nutritionFacts.servings_per_container}
                        onChange={(e) => onNutritionFactsChange({ ...nutritionFacts, servings_per_container: e.target.value })}
                        placeholder="30"
                    />
                </div>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea
                    className="input-field"
                    rows={2}
                    value={nutritionFacts.notes}
                    onChange={(e) => onNutritionFactsChange({ ...nutritionFacts, notes: e.target.value })}
                    placeholder="Valores aproximados."
                />
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Nutrientes</label>
                <div className="space-y-3">
                    {nutritionFacts.nutrients.map((n, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 items-center">
                            <input
                                className="input-field col-span-1"
                                placeholder="Nombre"
                                value={n.name}
                                onChange={(e) => handleNutrientChange(i, 'name', e.target.value)}
                            />
                            <input
                                className="input-field col-span-1"
                                placeholder="Cantidad"
                                value={n.amount}
                                onChange={(e) => handleNutrientChange(i, 'amount', e.target.value)}
                            />
                            <input
                                className="input-field col-span-1"
                                placeholder="Unidad"
                                value={n.unit}
                                onChange={(e) => handleNutrientChange(i, 'unit', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => removeNutrient(i)}
                                className="text-red-600 hover:text-red-800 text-sm"
                            >
                                ❌
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    className="btn-secondary mt-3"
                    onClick={addNutrient}
                >
                    + Agregar Nutriente
                </button>
            </div>
        </div>
    )
}
