import express from 'express';
import { Pool } from 'pg';

const app = express();
const pool = new Pool({
  user: "postgres",      // your db user
  host: "localhost",
  database: "your_db",
  password: "your_pw",
  port: 5432
});

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.send(result.rows);
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
