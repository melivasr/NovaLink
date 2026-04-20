const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'products-db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432
});

// GET all
const getAllSkills = async (req, res) => {
  try {
    const results = await pool.query(
      'SELECT id, name, difficulty, xp_points, price, stock, is_activated, created_at FROM products ORDER BY created_at ASC'
    );

    res.status(200).json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error obteniendo habilidades');
  }
};

// GET by id
const getSkillById = async (req, res) => {
  const id = req.params.id;

  try {
    const results = await pool.query(
      'SELECT id, name, difficulty, xp_points, price, stock, is_activated, created_at FROM products WHERE id = $1',
      [id]
    );

    if (results.rows.length === 0) {
      return res.status(404).send('Habilidad no encontrada');
    }

    res.status(200).json(results.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error obteniendo la habilidad');
  }
};

// POST
const createSkill = async (req, res) => {
  const { name, difficulty, stock, points, price } = req.body;

  if (!name || !difficulty || stock === undefined || points === undefined || price === undefined) {
    return res.status(400).send('Faltan datos');
  }

  try {
    const results = await pool.query(
      'INSERT INTO products (name, difficulty, xp_points, price, stock, is_activated) VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *',
      [name, difficulty, points, price, stock]
    );

    res.status(201).json(results.rows[0]);
  } catch (error) {
    console.error(error);

    if (error.code === '23505') {
      return res.status(400).send('Nombre duplicado');
    }

    res.status(500).send('Error creando habilidad');
  }
};

// PUT
const updateSkill = async (req, res) => {
  const id = req.params.id;
  const { name, difficulty, stock, points } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).send('Habilidad no encontrada');
    }

    const current = existing.rows[0];

    const updatedName = name || current.name;
    const updatedDifficulty = difficulty || current.difficulty;
    const updatedStock = stock !== undefined ? stock : current.stock;
    const updatedPoints = points !== undefined ? points : current.xp_points;

    const updatedActivated = req.body.is_activated !== undefined ? req.body.is_activated : current.is_activated;

    const results = await pool.query(
      `UPDATE products
       SET name = $1,
           difficulty = $2,
           xp_points = $3,
           stock = $4,
           is_activated = $5
       WHERE id = $6
       RETURNING *`,
      [updatedName, updatedDifficulty, updatedPoints, updatedStock, updatedActivated, id]
    );

    res.status(200).json(results.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error actualizando habilidad');
  }
};

// DELETE
const deleteSkill = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Habilidad no encontrada');
    }

    res.status(200).send('Habilidad eliminada');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error eliminando habilidad');
  }
};

module.exports = {getAllSkills, getSkillById, 
  createSkill, updateSkill, deleteSkill};