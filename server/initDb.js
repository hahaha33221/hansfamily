import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const membersJsonPath = path.join(__dirname, '../src/data/members.json');

async function init() {
  console.log('Connecting to MySQL database...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('Database connected.');

  // Create members table
  console.log('Creating members table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS members (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      gender VARCHAR(20),
      birthYear INT,
      category VARCHAR(50),
      spouseId VARCHAR(50),
      parentIds JSON,
      childIds JSON,
      groupId VARCHAR(50),
      note TEXT,
      profileImage LONGTEXT,
      username VARCHAR(100) UNIQUE,
      password VARCHAR(100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Clear existing members
  console.log('Clearing existing data...');
  await connection.query('DELETE FROM members');

  // Load members.json
  console.log('Reading members.json...');
  const rawData = fs.readFileSync(membersJsonPath, 'utf8');
  const members = JSON.parse(rawData);

  console.log(`Inserting ${members.length} members...`);
  for (const member of members) {
    await connection.query(
      `INSERT INTO members (
        id, name, gender, birthYear, category, spouseId, 
        parentIds, childIds, groupId, note, profileImage, username, password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        member.id,
        member.name,
        member.gender || null,
        member.birthYear || null,
        member.category || null,
        member.spouseId || null,
        JSON.stringify(member.parentIds || []),
        JSON.stringify(member.childIds || []),
        member.groupId || null,
        member.note || '',
        member.profileImage || null,
        member.username,
        member.password
      ]
    );
  }

  console.log('Database successfully initialized with initial members!');
  await connection.end();
}

init().catch((err) => {
  console.error('Error initializing database:', err);
  process.exit(1);
});
