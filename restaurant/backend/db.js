const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const poolPromise = Promise.resolve({
  request: () => {
    const params = [];
    const obj = {
      input: function(name, type, value) {
        params.push(value);
        return obj;
      },
      query: async function(q) {
        const fixedQ = q.replace(/@(\w+)/g, (_, name) => {
          const idx = params.findIndex((_, i) => i === params.indexOf(_));
          return `$${params.indexOf(_) + 1}`;
        });
        const result = await pool.query(q, params);
        return { recordset: result.rows };
      }
    };
    return obj;
  }
});

const sql = {
  NVarChar: 'text',
  Int: 'integer', 
  Decimal: () => 'decimal'
};

module.exports = { sql, poolPromise }; 