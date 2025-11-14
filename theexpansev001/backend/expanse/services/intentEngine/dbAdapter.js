import pkg from "pg"
const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
})

const dbAdapter = {
  async getEntityList(table, column) {
    const query = `SELECT DISTINCT ${column} FROM ${table} WHERE ${column} IS NOT NULL`
    try {
      const { rows } = await pool.query(query)
      return rows.map(r => r[column])
    } catch (err) {
      console.error("[DBADAPTER]", err)
      return []
    }
  }
}

export default dbAdapter
