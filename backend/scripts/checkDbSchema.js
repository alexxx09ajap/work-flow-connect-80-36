
const messageModel = require('../models/messageModel');
const db = require('../config/database');

async function checkAndUpdateDbSchema() {
  console.log('Verificando y actualizando esquema de base de datos...');

  try {
    // Verificar y agregar columna deleted a la tabla Messages
    const deletedColumnAdded = await messageModel.addDeletedColumn();
    
    if (deletedColumnAdded) {
      console.log('Esquema de la tabla Messages actualizado con éxito');
    } else {
      console.log('El esquema de la tabla Messages ya está actualizado');
    }

    // Verificar si hay otras tablas o columnas que necesiten actualización
    // Aquí se pueden agregar más verificaciones en el futuro
    
    console.log('Verificación y actualización de esquema completada');
  } catch (error) {
    console.error('Error al verificar y actualizar el esquema:', error);
  }
}

// Si este archivo se ejecuta directamente
if (require.main === module) {
  checkAndUpdateDbSchema()
    .then(() => {
      console.log('Script de verificación completado');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error en script de verificación:', err);
      process.exit(1);
    });
} else {
  // Exportar para uso en otros archivos
  module.exports = { checkAndUpdateDbSchema };
}
