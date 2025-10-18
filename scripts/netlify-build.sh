#!/bin/bash

# Script de build para Netlify que maneja dependencias opcionales de Rollup
set -e

echo "🔧 Instalando dependencias..."
npm ci --legacy-peer-deps

echo "🎯 Instalando dependencia opcional de Rollup para Linux..."
npm install @rollup/rollup-linux-x64-gnu --save-optional --legacy-peer-deps || echo "⚠️  Dependencia opcional no disponible, continuando..."

echo "🏗️  Ejecutando build..."
npm run build

echo "📁 Verificando archivo _redirects..."
if [ -f "dist/_redirects" ]; then
  echo "✅ Archivo _redirects encontrado en dist/"
else
  echo "⚠️  Archivo _redirects no encontrado, copiando desde public/"
  cp public/_redirects dist/_redirects 2>/dev/null || echo "❌ No se pudo copiar _redirects"
fi

echo "✅ Build completado exitosamente"
