# Auditoría Técnica: chmarket-admin-panel

**Fecha:** 2026-04-11

---

## 1. Archivos con Demasiadas Líneas de Código

El siguiente listado muestra los archivos reales (componentes/pages/hooks/viewmodels) con más de **250 líneas**, lo que implica dificultad potencial de mantenimiento, testing o extensión:

| Archivo                                                      | Líneas |
|--------------------------------------------------------------|--------|
| src/pages/Dashboard.tsx                                      | 473    |
| src/pages/DiscountForm.tsx                                   | 451    |
| src/hooks/useProductForm.ts                                  | 417    |
| src/hooks/useProductSubmit.ts                                | 384    |
| src/pages/Products.tsx                                       | 352    |
| src/components/product-form/MultipleVariantsForm.tsx         | 341    |
| src/pages/OrderDetail.tsx                                    | 311    |
| src/pages/Discounts.tsx                                      | 300    |
| src/pages/ProductForm.tsx                                    | 287    |
| src/presentation/viewmodels/ProductViewModel.ts              | 242    |
| src/presentation/viewmodels/AuthViewModel.ts                 | 224    |
| src/types/index.ts                                           | 214    |
| src/components/MultiSelect.tsx                               | 213    |
| src/components/product-form/FeaturesAndIngredients.tsx       | 212    |
| src/data/datasources/ProductDataSource.ts                    | 210    |
| src/hooks/useProducts.ts                                     | 199    |
| src/pages/Categories.tsx                                     | 197    |
| src/pages/Orders.tsx                                         | 189    |
| src/pages/Login.tsx                                          | 174    |
| src/components/product-form/BasicProductInfo.tsx             | 171    |
| src/components/Layout.tsx                                    | 164    |
| src/data/datasources/DiscountDataSource.ts                   | 163    |
| src/data/datasources/OrderDataSource.ts                      | 156    |
| src/hooks/__tests__/useOrders.test.tsx                       | 155    |
| src/application/container.ts                                 | 147    |
| src/hooks/__tests__/useProducts.test.tsx                     | 146    |
| src/utils/format.ts                                          | 145    |
| src/presentation/viewmodels/CategoryViewModel.ts             | 145    |
| src/hooks/__tests__/useDiscounts.test.tsx                    | 143    |

**Observaciones:**
- Los archivos de Pages suelen contener el "feature" entero, provocando gran tamaño.
- Hooks customizados como `useProductForm` y `useProductSubmit` superan lo recomendable.
- Hay varios viewmodels, datasources y utilidades por encima de 140/200 líneas.

---

## 2. Duplicidad de Código

### Áreas de mayor duplicidad

- **Hooks personalizados**
  - `useProductForm.ts`, `useProductSubmit.ts`, `useProducts.ts` repiten patrones de validación, mutaciones, estado y manejo de errores.
- **Formularios complejos**
  - Ejemplo: `MultipleVariantsForm.tsx`, `FeaturesAndIngredients.tsx`, `BasicProductInfo.tsx` vuelven a implementar validaciones, slices de estado y lógica visual.
- **Tests**
  - Setup (renderHook, QueryClient, mocks) repetido entre `useProducts`, `useOrders`, `useCategories`, `useDiscounts` test files.

### Ejemplo de duplicados estructurales:
- Hooks CRUD (`useProducts`, `useOrders`, `useDiscounts`, `useCategories`):
  - Todos implementan: carga inicial, manejo de loading y error, y lógica de mutaciones con patrones repetidos.
- Lógica de validación de formularios:
  - Validaciones de campos y control de errores similar en casi todos los componentes de formulario de producto/descuento/orden/categoría.
- Tests:
  - El mismo patrón de mock de ViewModel y uso de QueryClientProvider se copia entre archivos.

---

## 3. Módulos y Dominios Analizados

- **src/pages/**
- **src/hooks/**
- **src/components/**
- **src/presentation/viewmodels/**
- **src/data/datasources/**
- **src/types/**
- **src/application/**
- **src/utils/**
- **tests: src/hooks/__tests__/**

(Nota: _Las mismas conclusiones aplican en lo general para `domain/` y `data/`, donde datasources repiten manejo de errores y llamadas con poca variación_).

---

## 4. Resumen Ejecutivo

- Hay **componentes de página, hooks y viewmodels** que exceden ampliamente los estándares de tamaño y pueden dificultar cambios, pruebas o depuración.
- **Formularios complejos y hooks** muestran signos claros de lógica duplicada, sobre todo en validación y manejo de estados.
- En **tests** la duplicidad de patrones de setup es notoria (muchos archivos usan el mismo bloque base de inicialización).
- **No se han realizado cambios ni planes de acción:** _esto es diagnóstico puro para ser utilizado en la futura planificación del mantenimiento_.

---

**Actualizado a:** 2026-04-11
