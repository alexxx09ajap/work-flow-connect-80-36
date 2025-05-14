
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

    // Verificar si la tabla Files existe, si no, crearla
    const filesTableExists = await checkTableExists('Files');
    if (!filesTableExists) {
      await createFilesTable();
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

// Función para crear la tabla Files
async function createFilesTable() {
  try {
    await db.query(`
      CREATE TABLE "Files" (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        content_type VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        data BYTEA NOT NULL,
        uploaded_by UUID REFERENCES "Users"(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // También verificamos si necesitamos crear la tabla files (minúsculas) como alias
    await db.query(`
      CREATE VIEW files AS SELECT * FROM "Files";
    `);
    
    console.log('Vista files creada como alias de Files');
  } catch (error) {
    console.error('Error al crear la tabla Files:', error);
    throw error;
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
