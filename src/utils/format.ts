export const formatCurrency = (
  cents: number,
  currency: string = 'COP'
): string => {
  const amount = cents / 100;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    CREATED: 'Creado',
    PAID: 'Pagado',
    FULFILLED: 'Completado',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reembolsado',
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    CREATED: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    FULFILLED: 'bg-purple-100 text-purple-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-orange-100 text-orange-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Funciones para formatear inputs de precios
export const formatPriceInput = (cents: string | number): string => {
  if (!cents || cents === '' || cents === '0') return '';
  const numCents = typeof cents === 'string' ? parseInt(cents, 10) : cents;
  if (isNaN(numCents) || numCents === 0) return '';

  const amount = numCents / 100;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parsePriceInput = (formattedValue: string): string => {
  if (!formattedValue || formattedValue.trim() === '') return '';

  // Remover símbolos de moneda y espacios
  const cleanValue = formattedValue.replace(/[^\d]/g, '');

  if (!cleanValue || cleanValue === '0') return '';

  // Convertir a centavos (asumiendo que el usuario ingresa pesos)
  const pesos = parseInt(cleanValue, 10);
  if (isNaN(pesos) || pesos === 0) return '';

  return (pesos * 100).toString();
};

export const formatPriceForDisplay = (cents: string | number): string => {
  if (!cents || cents === '') return '';
  const numCents = typeof cents === 'string' ? parseInt(cents, 10) : cents;
  if (isNaN(numCents)) return '';

  return formatCurrency(numCents);
};
