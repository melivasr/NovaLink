const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'users-db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432
});

const getAllUsers = async (req, res) => {
  try {
    const results = await pool.query(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at ASC'
    );
    res.status(200).json({ success: true, data: results.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error obteniendo usuarios' });
  }
};

const getUserById = async (req, res) => {
  const id = req.params.id;

  try {
    const results = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id]
    );

    if (results.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: results.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }
};

const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Nombre, email y password son requeridos'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email inválido'
    });
  }

  try {
    const results = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, password]
    );

    res.status(201).json({
      success: true,
      data: results.rows[0],
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    console.error(error);

    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'El email ya existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creando usuario'
    });
  }
};

const updateUser = async (req, res) => {
  const id = req.params.id;
  const { name, email, password } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const current = existing.rows[0];

    const updatedName = name !== undefined ? name : current.name;
    const updatedEmail = email !== undefined ? email : current.email;
    const updatedPassword = password !== undefined ? password : current.password_hash;

    const results = await pool.query(
      `UPDATE users
       SET name = $1,
           email = $2,
           password_hash = $3
       WHERE id = $4
       RETURNING id, name, email, created_at`,
      [updatedName, updatedEmail, updatedPassword, id]
    );

    res.status(200).json({
      success: true,
      data: results.rows[0],
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    console.error(error);

    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'El email ya existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error actualizando usuario'
    });
  }
};

const deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query('DELETE FROM user_skills WHERE user_id = $1', [id]);

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando usuario'
    });
  }
};

const getUserSkills = async (req, res) => {
  const id = req.params.id;

  try {
    const userResult = await pool.query(
      'SELECT id, name FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const skillsResult = await pool.query(
      `SELECT product_id, acquired_at
       FROM user_skills
       WHERE user_id = $1
       ORDER BY acquired_at ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: skillsResult.rows,
      message: `Habilidades del usuario ${userResult.rows[0].name}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo habilidades del usuario'
    });
  }
};

const addSkillToUser = async (req, res) => {
  const id = req.params.id;
  const { skillId } = req.body;

  if (!skillId) {
    return res.status(400).json({
      success: false,
      message: 'skillId es requerido'
    });
  }

  try {
    const userResult = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const existingSkill = await pool.query(
      'SELECT * FROM user_skills WHERE user_id = $1 AND product_id = $2',
      [id, skillId]
    );

    if (existingSkill.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya posee esta habilidad'
      });
    }

    await pool.query(
      `INSERT INTO user_skills (user_id, product_id)
       VALUES ($1, $2)`,
      [id, skillId]
    );

    const updatedSkills = await pool.query(
      `SELECT product_id, acquired_at
       FROM user_skills
       WHERE user_id = $1
       ORDER BY acquired_at ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        user: userResult.rows[0],
        skills: updatedSkills.rows
      },
      message: 'Habilidad agregada exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error agregando habilidad al usuario'
    });
  }
};

const removeSkillFromUser = async (req, res) => {
  const id = req.params.id;
  const { skillId } = req.body;

  if (!skillId) {
    return res.status(400).json({
      success: false,
      message: 'skillId es requerido'
    });
  }

  try {
    const userResult = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const result = await pool.query(
      'DELETE FROM user_skills WHERE user_id = $1 AND product_id = $2',
      [id, skillId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no posee esta habilidad'
      });
    }

    const updatedSkills = await pool.query(
      `SELECT product_id, acquired_at
       FROM user_skills
       WHERE user_id = $1
       ORDER BY acquired_at ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        user: userResult.rows[0],
        skills: updatedSkills.rows
      },
      message: 'Habilidad removida exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error removiendo habilidad del usuario'
    });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y password son requeridos'
    })
  }

  try {
    const results = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1 AND password_hash = $2',
      [email, password]
    )

    if (results.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email o password incorrectos'
      })
    }

    res.status(200).json({
      success: true,
      data: results.rows[0],
      message: 'Login exitoso'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error en login'
    })
  }
}

module.exports = {getAllUsers, getUserById, createUser, updateUser,
  deleteUser, getUserSkills, addSkillToUser, removeSkillFromUser, loginUser};