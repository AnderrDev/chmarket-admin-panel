#!/bin/bash

# Script de build para Netlify que maneja dependencias opcionales de Rollup
set -e

echo "🔧 Instalando dependencias..."
npm ci --legacy-peer-deps

echo "🎯 Instalando dependencia opcional de Rollup para Linux..."
npm install @rollup/rollup-linux-x64-gnu --save-optional --legacy-peer-deps || echo "⚠️  Dependencia opcional no disponible, continuando..."

echo "🏗️  Ejecutando build..."
npm run build

echo "✅ Build completado exitosamente"
