const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { body, validationResult } = require('express-validator');
const config = require('./config');

const app = express();
const port = config.server.port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración de la conexión a la base de datos
const pool = mysql.createPool(config.database);

// Validaciones para pacientes
const pacienteValidations = [
  body('ID').notEmpty().withMessage('El id es requerido'),
  body('Nombre').notEmpty().withMessage('El nombre es requerido'),
  body('Direccion').notEmpty().withMessage('La dirección es requerida'),
  body('Numero_Telefono').isInt().withMessage('El número de teléfono debe ser un número entero'),
  body('Desc_Ciudad').isInt().withMessage('La ciudad es requerida')
];

// Validaciones para diagnósticos
const diagnosticoValidations = [
  body('Id_Paciente').isInt().withMessage('El ID del paciente es requerido'),
  body('Condicion').notEmpty().withMessage('La condición es requerida')
];

// Rutas para pacientes
app.get('/api/pacientes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT p.Id_Paciente, p.Nombre, p.Fecha_Nacimiento, p.Direccion, p.Numero_Telefono, c.Desc_Ciudad FROM pacientes p INNER JOIN ciudades c ON p.Id_Ciudad = c.Id_Ciudades');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

app.post('/api/pacientes', pacienteValidations, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { Id_Paciente, Nombre, Direccion, Numero_Telefono, Desc_Ciudad } = req.body;
    const [result] = await pool.query(
      'INSERT INTO pacientes (Id_Paciente, Nombre, Fecha_Nacimiento, Direccion, Numero_Telefono, Ciudad) VALUES (?, ?, CURDATE(), ?, ?, ?)',
      [Id_Paciente, Nombre, Direccion, Numero_Telefono, Desc_Ciudad]
    );
    res.status(201).json({ id: result.insertId, message: 'Paciente creado exitosamente' });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El número de teléfono ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear paciente' });
    }
  }
});

app.put('/api/pacientes/:id', pacienteValidations, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  
    const { Id_Paciente, Nombre, Direccion, Numero_Telefono, Desc_Ciudad } = req.body;
    
    const [result] = await pool.query(
      ' UPDATE pacientes SET Id_Paciente = ?, Nombre = ?, Direccion = ?, Numero_Telefono = ?, Id_Ciudad = (SELECT Id_Ciudades FROM ciudades WHERE Desc_Ciudad = ?)',
      [Id_Paciente, Nombre, Direccion, Numero_Telefono, Desc_Ciudad]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json({ message: 'Paciente actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El número de teléfono ya existe' });
    } else {
      res.status(500).json({ error: 'Error al actualizar paciente' });
    }
  }
});

app.delete('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM pacientes WHERE Id_Paciente = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json({ message: 'Paciente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ error: 'No se puede eliminar el paciente porque tiene diagnósticos asociados' });
    } else {
      res.status(500).json({ error: 'Error al eliminar paciente' });
    }
  }
});

// Rutas para diagnósticos
app.get('/api/diagnosticos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM diagnosticos');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener diagnósticos:', error);
    res.status(500).json({ error: 'Error al obtener diagnósticos' });
  }
});

app.post('/api/diagnosticos', diagnosticoValidations, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { Id_Paciente, Condicion } = req.body;
    const [result] = await pool.query(
      'INSERT INTO diagnosticos (Id_Paciente, Condicion, Fecha) VALUES (?, ?, CURDATE())',
      [Id_Paciente, Condicion]
    );
    res.status(201).json({ id: result.insertId, message: 'Diagnóstico creado exitosamente' });
  } catch (error) {
    console.error('Error al crear diagnóstico:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({ error: 'El paciente no existe' });
    } else {
      res.status(500).json({ error: 'Error al crear diagnóstico' });
    }
  }
});

app.put('/api/diagnosticos/:id', diagnosticoValidations, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { Id_Paciente, Condicion } = req.body;
    
    const [result] = await pool.query(
      'UPDATE diagnosticos SET Id_Paciente = ?, Condicion = ? WHERE Id_Diagnostico = ?',
      [Id_Paciente, Condicion, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    res.json({ message: 'Diagnóstico actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar diagnóstico:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({ error: 'El paciente no existe' });
    } else {
      res.status(500).json({ error: 'Error al actualizar diagnóstico' });
    }
  }
});

app.delete('/api/diagnosticos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM diagnosticos WHERE Id_Diagnostico = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    res.json({ message: 'Diagnóstico eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar diagnóstico:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ error: 'No se puede eliminar el diagnóstico porque está asociado a un plan de tratamiento' });
    } else {
      res.status(500).json({ error: 'Error al eliminar diagnóstico' });
    }
  }
});

// CRUD para ciudades
app.get('/api/ciudades', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ciudades');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ciudades' });
  }
});

app.post('/api/ciudades', [
  body('Desc_Ciudad').notEmpty().withMessage('La descripción es requerida'),
  body('Id_Deparamento').isInt().withMessage('El departamento es requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { Desc_Ciudad, Id_Deparamento } = req.body;
    const [result] = await pool.query('INSERT INTO ciudades (Desc_Ciudad, Id_Deparamento) VALUES (?, ?)', [Desc_Ciudad, Id_Deparamento]);
    res.status(201).json({ id: result.insertId, message: 'Ciudad creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear ciudad' });
  }
});

app.put('/api/ciudades/:id', [
  body('Desc_Ciudad').notEmpty().withMessage('La descripción es requerida'),
  body('Id_Deparamento').isInt().withMessage('El departamento es requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { Desc_Ciudad, Id_Deparamento } = req.body;
    const [result] = await pool.query('UPDATE ciudades SET Desc_Ciudad = ?, Id_Deparamento = ? WHERE Id_Ciudades = ?', [Desc_Ciudad, Id_Deparamento, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }
    res.json({ message: 'Ciudad actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar ciudad' });
  }
});

app.delete('/api/ciudades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM ciudades WHERE Id_Ciudades = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }
    res.json({ message: 'Ciudad eliminada exitosamente' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ error: 'No se puede eliminar la ciudad porque tiene pacientes asociados' });
    } else {
      res.status(500).json({ error: 'Error al eliminar ciudad' });
    }
  }
});

// CRUD para departamentos
app.get('/api/departamentos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departamentos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener departamentos' });
  }
});

app.post('/api/departamentos', [
  body('Desc_Departamento').notEmpty().withMessage('La descripción es requerida'),
  body('Id_Pais').isInt().withMessage('El país es requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { Desc_Departamento, Id_Pais } = req.body;
    const [result] = await pool.query('INSERT INTO departamentos (Desc_Departamento, Id_Pais) VALUES (?, ?)', [Desc_Departamento, Id_Pais]);
    res.status(201).json({ id: result.insertId, message: 'Departamento creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear departamento' });
  }
});

app.put('/api/departamentos/:id', [
  body('Desc_Departamento').notEmpty().withMessage('La descripción es requerida'),
  body('Id_Pais').isInt().withMessage('El país es requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { Desc_Departamento, Id_Pais } = req.body;
    const [result] = await pool.query('UPDATE departamentos SET Desc_Departamento = ?, Id_Pais = ? WHERE Id_Departamento = ?', [Desc_Departamento, Id_Pais, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Departamento no encontrado' });
    }
    res.json({ message: 'Departamento actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar departamento' });
  }
});

app.delete('/api/departamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM departamentos WHERE Id_Departamento = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Departamento no encontrado' });
    }
    res.json({ message: 'Departamento eliminado exitosamente' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ error: 'No se puede eliminar el departamento porque tiene ciudades asociadas' });
    } else {
      res.status(500).json({ error: 'Error al eliminar departamento' });
    }
  }
});

// CRUD para paises
app.get('/api/paises', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM paises');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener países' });
  }
});

app.post('/api/paises', [
  body('Desc_Pais').notEmpty().withMessage('La descripción es requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { Desc_Pais } = req.body;
    const [result] = await pool.query('INSERT INTO paises (Desc_Pais) VALUES (?)', [Desc_Pais]);
    res.status(201).json({ id: result.insertId, message: 'País creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear país' });
  }
});

app.put('/api/paises/:id', [
  body('Desc_Pais').notEmpty().withMessage('La descripción es requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { Desc_Pais } = req.body;
    const [result] = await pool.query('UPDATE paises SET Desc_Pais = ? WHERE Id_Pais = ?', [Desc_Pais, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'País no encontrado' });
    }
    res.json({ message: 'País actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar país' });
  }
});

app.delete('/api/paises/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM paises WHERE Id_Pais = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'País no encontrado' });
    }
    res.json({ message: 'País eliminado exitosamente' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ error: 'No se puede eliminar el país porque tiene departamentos asociados' });
    } else {
      res.status(500).json({ error: 'Error al eliminar país' });
    }
  }
});

// CRUD para examenes
app.get('/api/examenes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM examenes');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener exámenes' });
  }
});

app.post('/api/examenes', [
  body('Examen').notEmpty().withMessage('El nombre del examen es requerido'),
  body('Fecha_Realizacion').notEmpty().withMessage('La fecha es requerida'),
  body('Id_Paciente').isInt().withMessage('El paciente es requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { Examen, Fecha_Realizacion, Id_Paciente } = req.body;
    const [result] = await pool.query('INSERT INTO examenes (Examen, Fecha_Realizacion, Id_Paciente) VALUES (?, ?, ?)', [Examen, Fecha_Realizacion, Id_Paciente]);
    res.status(201).json({ id: result.insertId, message: 'Examen creado exitosamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El nombre del examen ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear examen' });
    }
  }
});

app.put('/api/examenes/:id', [
  body('Examen').notEmpty().withMessage('El nombre del examen es requerido'),
  body('Fecha_Realizacion').notEmpty().withMessage('La fecha es requerida'),
  body('Id_Paciente').isInt().withMessage('El paciente es requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { Examen, Fecha_Realizacion, Id_Paciente } = req.body;
    const [result] = await pool.query('UPDATE examenes SET Examen = ?, Fecha_Realizacion = ?, Id_Paciente = ? WHERE Id_Examen = ?', [Examen, Fecha_Realizacion, Id_Paciente, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    res.json({ message: 'Examen actualizado exitosamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El nombre del examen ya existe' });
    } else {
      res.status(500).json({ error: 'Error al actualizar examen' });
    }
  }
});

app.delete('/api/examenes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM examenes WHERE Id_Examen = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    res.json({ message: 'Examen eliminado exitosamente' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ error: 'No se puede eliminar el examen porque tiene resultados asociados' });
    } else {
      res.status(500).json({ error: 'Error al eliminar examen' });
    }
  }
});

// CRUD para medicamentos
app.get('/api/medicamentos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medicamentos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener medicamentos' });
  }
});

app.post('/api/medicamentos', [
  body('Id_Paciente').isInt().withMessage('El paciente es requerido'),
  body('Desc_Medicamento').notEmpty().withMessage('La descripción es requerida'),
  body('Dosis').notEmpty().withMessage('La dosis es requerida'),
  body('Instrucciones').notEmpty().withMessage('Las instrucciones son requeridas')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { Id_Paciente, Desc_Medicamento, Dosis, Instrucciones } = req.body;
    const [result] = await pool.query('INSERT INTO medicamentos (Id_Paciente, Desc_Medicamento, Dosis, Instrucciones) VALUES (?, ?, ?, ?)', [Id_Paciente, Desc_Medicamento, Dosis, Instrucciones]);
    res.status(201).json({ id: result.insertId, message: 'Medicamento creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear medicamento' });
  }
});

app.put('/api/medicamentos/:id', [
  body('Id_Paciente').isInt().withMessage('El paciente es requerido'),
  body('Desc_Medicamento').notEmpty().withMessage('La descripción es requerida'),
  body('Dosis').notEmpty().withMessage('La dosis es requerida'),
  body('Instrucciones').notEmpty().withMessage('Las instrucciones son requeridas')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { Id_Paciente, Desc_Medicamento, Dosis, Instrucciones } = req.body;
    const [result] = await pool.query('UPDATE medicamentos SET Id_Paciente = ?, Desc_Medicamento = ?, Dosis = ?, Instrucciones = ? WHERE Id_Medicamento = ?', [Id_Paciente, Desc_Medicamento, Dosis, Instrucciones, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }
    res.json({ message: 'Medicamento actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar medicamento' });
  }
});

app.delete('/api/medicamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM medicamentos WHERE Id_Medicamento = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }
    res.json({ message: 'Medicamento eliminado exitosamente' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ error: 'No se puede eliminar el medicamento porque tiene resultados asociados' });
    } else {
      res.status(500).json({ error: 'Error al eliminar medicamento' });
    }
  }
});

// CRUD para plantratamiento
app.get('/api/plantratamiento', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM plantratamiento');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener planes de tratamiento' });
  }
});

app.post('/api/plantratamiento', [
  body('Id_Paciente').isInt().withMessage('El paciente es requerido'),
  body('Id_Diagnostico').isInt().withMessage('El diagnóstico es requerido'),
  body('Tratamiento').notEmpty().withMessage('El tratamiento es requerido'),
  body('Fecha').notEmpty().withMessage('La fecha es requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { Id_Paciente, Id_Diagnostico, Tratamiento, Fecha } = req.body;
    const [result] = await pool.query('INSERT INTO plantratamiento (Id_Paciente, Id_Diagnostico, Tratamiento, Fecha) VALUES (?, ?, ?, ?)', [Id_Paciente, Id_Diagnostico, Tratamiento, Fecha]);
    res.status(201).json({ id: result.insertId, message: 'Plan de tratamiento creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear plan de tratamiento' });
  }
});

app.put('/api/plantratamiento/:id', [
  body('Id_Paciente').isInt().withMessage('El paciente es requerido'),
  body('Id_Diagnostico').isInt().withMessage('El diagnóstico es requerido'),
  body('Tratamiento').notEmpty().withMessage('El tratamiento es requerido'),
  body('Fecha').notEmpty().withMessage('La fecha es requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { Id_Paciente, Id_Diagnostico, Tratamiento, Fecha } = req.body;
    const [result] = await pool.query('UPDATE plantratamiento SET Id_Paciente = ?, Id_Diagnostico = ?, Tratamiento = ?, Fecha = ? WHERE Id_Plan = ?', [Id_Paciente, Id_Diagnostico, Tratamiento, Fecha, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Plan de tratamiento no encontrado' });
    }
    res.json({ message: 'Plan de tratamiento actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar plan de tratamiento' });
  }
});

app.delete('/api/plantratamiento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM plantratamiento WHERE Id_Plan = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Plan de tratamiento no encontrado' });
    }
    res.json({ message: 'Plan de tratamiento eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar plan de tratamiento' });
  }
});

// CRUD para resultado_lab
app.get('/api/resultado_lab', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM resultado_lab');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resultados de laboratorio' });
  }
});

app.post('/api/resultado_lab', [
  body('Id_Medicamento').isInt().withMessage('El medicamento es requerido'),
  body('Id_Examen').isInt().withMessage('El examen es requerido'),
  body('Valor').isInt().withMessage('El valor es requerido'),
  body('Fecha').notEmpty().withMessage('La fecha es requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { Id_Medicamento, Id_Examen, Valor, Fecha } = req.body;
    const [result] = await pool.query('INSERT INTO resultado_lab (Id_Medicamento, Id_Examen, Valor, Fecha) VALUES (?, ?, ?, ?)', [Id_Medicamento, Id_Examen, Valor, Fecha]);
    res.status(201).json({ id: result.insertId, message: 'Resultado de laboratorio creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear resultado de laboratorio' });
  }
});

app.put('/api/resultado_lab/:id', [
  body('Id_Medicamento').isInt().withMessage('El medicamento es requerido'),
  body('Id_Examen').isInt().withMessage('El examen es requerido'),
  body('Valor').isInt().withMessage('El valor es requerido'),
  body('Fecha').notEmpty().withMessage('La fecha es requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { Id_Medicamento, Id_Examen, Valor, Fecha } = req.body;
    const [result] = await pool.query('UPDATE resultado_lab SET Id_Medicamento = ?, Id_Examen = ?, Valor = ?, Fecha = ? WHERE Id_Resultado = ?', [Id_Medicamento, Id_Examen, Valor, Fecha, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resultado de laboratorio no encontrado' });
    }
    res.json({ message: 'Resultado de laboratorio actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar resultado de laboratorio' });
  }
});

app.delete('/api/resultado_lab/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM resultado_lab WHERE Id_Resultado = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resultado de laboratorio no encontrado' });
    }
    res.json({ message: 'Resultado de laboratorio eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar resultado de laboratorio' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}); 