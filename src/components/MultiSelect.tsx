import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  description?: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  maxHeight?: string;
  disabled?: boolean;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  label,
  placeholder = 'Seleccionar opciones...',
  searchPlaceholder = 'Buscar...',
  maxHeight = '200px',
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar opciones basado en búsqueda
  const filteredOptions = options.filter(
    option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.description &&
        option.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Obtener opciones seleccionadas para mostrar
  const selectedOptions = options.filter(option =>
    selected.includes(option.id)
  );

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionId: string) => {
    if (disabled) return;

    const newSelected = selected.includes(optionId)
      ? selected.filter(id => id !== optionId)
      : [...selected, optionId];

    onChange(newSelected);
  };

  const handleRemove = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    const newSelected = selected.filter(id => id !== optionId);
    onChange(newSelected);
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      const option = options.find(opt => opt.id === selected[0]);
      return option?.name || 'Opción seleccionada';
    }
    return `${selected.length} opciones seleccionadas`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-left border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${
              disabled
                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-900 cursor-pointer hover:border-gray-400'
            }
            ${isOpen ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-300'}
          `}
        >
          <div className="flex items-center justify-between">
            <span
              className={
                selected.length === 0 ? 'text-gray-500' : 'text-gray-900'
              }
            >
              {getDisplayText()}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {/* Barra de búsqueda */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Lista de opciones */}
            <div className="overflow-y-auto" style={{ maxHeight }}>
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {searchTerm
                    ? 'No se encontraron opciones'
                    : 'No hay opciones disponibles'}
                </div>
              ) : (
                filteredOptions.map(option => {
                  const isSelected = selected.includes(option.id);

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleToggle(option.id)}
                      className={`
                        px-3 py-2 cursor-pointer text-sm flex items-center justify-between
                        hover:bg-gray-50 transition-colors
                        ${isSelected ? 'bg-primary-50 text-primary-700' : 'text-gray-900'}
                      `}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{option.name}</div>
                        {option.description && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {option.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {isSelected && (
                          <div className="w-4 h-4 bg-primary-600 rounded-sm flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tags de opciones seleccionadas */}
      {selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedOptions.map(option => (
            <span
              key={option.id}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
            >
              {option.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={e => handleRemove(option.id, e)}
                  className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
