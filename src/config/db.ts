import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: "nbp_owner",
  password: "ucGzJ4ywsjO1",
  host: "ep-falling-union-a4n7a7y7.us-east-1.aws.neon.tech",
  port: 5432,
  database: "nbp",
  ssl: true
});

export default pool;
