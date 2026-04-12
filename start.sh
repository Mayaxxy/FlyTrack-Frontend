#!/bin/bash

echo "🚀 Iniciando FlyTrack Frontend..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 20 o superior."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Se requiere Node.js 20 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Verificar si el backend está corriendo
echo "🔍 Verificando conexión con el backend..."
if curl -s http://localhost:8080/api/flights/public/upcoming > /dev/null 2>&1; then
    echo "✅ Backend detectado en http://localhost:8080"
else
    echo "⚠️  Advertencia: No se pudo conectar al backend en http://localhost:8080"
    echo "   Asegúrate de que el backend esté corriendo antes de usar la aplicación."
fi
echo ""

# Iniciar la aplicación
echo "🌐 Iniciando servidor de desarrollo..."
echo "   La aplicación estará disponible en http://localhost:4200"
echo ""
echo "   Presiona Ctrl+C para detener el servidor"
echo ""

npm start
