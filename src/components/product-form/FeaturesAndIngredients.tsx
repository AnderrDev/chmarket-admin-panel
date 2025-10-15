// src/components/product-form/FeaturesAndIngredients.tsx
import { ArrowUp, ArrowDown, X } from 'lucide-react';
import { useAutoResize } from '@/hooks/useAutoResize';

interface FeaturesAndIngredientsProps {
  features: string[];
  ingredients: string[];
  featuresInput: string;
  ingredientsInput: string;
  setFeaturesInput: (value: string) => void;
  setIngredientsInput: (value: string) => void;
  onFeaturesChange: (features: string[]) => void;
  onIngredientsChange: (ingredients: string[]) => void;
}

export default function FeaturesAndIngredients({
  features,
  ingredients,
  featuresInput,
  ingredientsInput,
  setFeaturesInput,
  setIngredientsInput,
  onFeaturesChange,
  onIngredientsChange,
}: FeaturesAndIngredientsProps) {
  const { textareaRef: featuresRef, handleInput: handleFeaturesInput } =
    useAutoResize();
  const { textareaRef: ingredientsRef, handleInput: handleIngredientsInput } =
    useAutoResize();
  // Helper functions
  function addFromTextarea(
    raw: string,
    current: string[],
    setFn: (arr: string[]) => void
  ) {
    const tokens = raw
      .split(/,|\n/)
      .map(t => t.trim())
      .filter(Boolean);
    const merged = Array.from(new Set([...current, ...tokens]));
    setFn(merged);
  }

  function removeAt(
    i: number,
    current: string[],
    setFn: (arr: string[]) => void
  ) {
    setFn(current.filter((_, idx) => idx !== i));
  }

  function moveIdx(
    i: number,
    dir: -1 | 1,
    current: string[],
    setFn: (arr: string[]) => void
  ) {
    const j = i + dir;
    if (j < 0 || j >= current.length) return;
    const arr = [...current];
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    setFn(arr);
  }

  const handleFeaturesKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!featuresInput.trim()) return;
      addFromTextarea(featuresInput, features, onFeaturesChange);
      setFeaturesInput('');
    }
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleFeaturesInput(e);
    setFeaturesInput(e.target.value);
  };

  const handleFeaturesPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text && (text.includes(',') || text.includes('\n'))) {
      e.preventDefault();
      addFromTextarea(text, features, onFeaturesChange);
      setFeaturesInput('');
    }
  };

  const handleIngredientsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!ingredientsInput.trim()) return;
      addFromTextarea(ingredientsInput, ingredients, onIngredientsChange);
      setIngredientsInput('');
    }
  };

  const handleIngredientsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    handleIngredientsInput(e);
    setIngredientsInput(e.target.value);
  };

  const handleIngredientsPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text && (text.includes(',') || text.includes('\n'))) {
      e.preventDefault();
      addFromTextarea(text, ingredients, onIngredientsChange);
      setIngredientsInput('');
    }
  };

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Features */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Características
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {features.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="inline-flex items-center rounded-full bg-gray-100 pl-2 pr-1 py-1 text-xs"
            >
              {t}
              <button
                type="button"
                className="ml-1 p-0.5"
                onClick={() => moveIdx(i, -1, features, onFeaturesChange)}
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                className="p-0.5"
                onClick={() => moveIdx(i, +1, features, onFeaturesChange)}
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                className="ml-1 p-0.5 text-gray-500 hover:text-gray-700"
                onClick={() => removeAt(i, features, onFeaturesChange)}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <textarea
          ref={featuresRef}
          className="input-field resize-none overflow-hidden"
          rows={2}
          placeholder="Micronizada, Sin azúcar, ..."
          value={featuresInput}
          onChange={handleFeaturesChange}
          onKeyDown={handleFeaturesKeyDown}
          onPaste={handleFeaturesPaste}
        />
      </div>

      {/* Ingredientes */}
      <div>
        <label className="block text-sm font-medium mb-1">Ingredientes</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {ingredients.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="inline-flex items-center rounded-full bg-gray-100 pl-2 pr-1 py-1 text-xs"
            >
              {t}
              <button
                type="button"
                className="ml-1 p-0.5"
                onClick={() => moveIdx(i, -1, ingredients, onIngredientsChange)}
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                className="p-0.5"
                onClick={() => moveIdx(i, +1, ingredients, onIngredientsChange)}
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                className="ml-1 p-0.5 text-gray-500 hover:text-gray-700"
                onClick={() => removeAt(i, ingredients, onIngredientsChange)}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <textarea
          ref={ingredientsRef}
          className="input-field resize-none overflow-hidden"
          rows={2}
          placeholder="Creatina monohidratada, Saborizante..."
          value={ingredientsInput}
          onChange={handleIngredientsChange}
          onKeyDown={handleIngredientsKeyDown}
          onPaste={handleIngredientsPaste}
        />
      </div>
    </div>
  );
}
