
const messageModel = require('../models/messageModel');
const db = require('../config/database');
const fileModel = require('../models/fileModel');

async function checkAndUpdateDbSchema() {
  console.log('Verificando y actualizando esquema de base de datos...');

  try {
    // Verificar y agregar columnas a la tabla Messages
    const deletedColumnAdded = await messageModel.addDeletedColumn();
    const editedColumnAdded = await messageModel.addEditedColumn();
    const fileIdColumnAdded = await messageModel.addFileIdColumn();
    
    if (deletedColumnAdded || editedColumnAdded || fileIdColumnAdded) {
      console.log('Esquema de la tabla Messages actualizado con éxito');
    } else {
      console.log('El esquema de la tabla Messages ya está actualizado');
    }

    // Verificar si la tabla Files existe, si no, crearla
    const filesTableCreated = await fileModel.ensureFilesTableExists();
    if (filesTableCreated) {
      console.log('Tabla Files creada con éxito');
    } else {
      console.log('La tabla Files ya existe');
    }
    
    // Verificar si hay otras tablas o columnas que necesiten actualización
    // Aquí se pueden agregar más verificaciones en el futuro
    
    console.log('Verificación y actualización de esquema completada');
  } catch (error) {
    console.error('Error al verificar y actualizar el esquema:', error);
  }
}

// Función para verificar si una tabla existe
async function checkTableExists(tableName) {
  try {
    const result = await db.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )`,
      [tableName]
    );
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error al verificar la existencia de la tabla ${tableName}:`, error);
    return false;
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
