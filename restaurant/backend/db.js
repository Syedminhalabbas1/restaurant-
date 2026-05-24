const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = {
  NVarChar: 'text',
  Int: 'int',
  Decimal: () => 'decimal'
};

const poolPromise = Promise.resolve({
  request: () => ({
    input: function() { return this; },
    query: async (q) => {
      const result = await pool.query(q);
      return { recordset: result.rows };
    }
  })
});

module.exports = { sql, poolPromise }; 