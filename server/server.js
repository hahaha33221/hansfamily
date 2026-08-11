import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Database connection helper
async function getDbConnection() {
  return await mysql.createConnection(dbConfig);
}

// 1. Fetch all members
app.get('/api/members', async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.query('SELECT * FROM members');
    await connection.end();
    
    // Parse JSON columns back to arrays
    const parsedRows = rows.map(row => ({
      ...row,
      parentIds: typeof row.parentIds === 'string' ? JSON.parse(row.parentIds) : (row.parentIds || []),
      childIds: typeof row.childIds === 'string' ? JSON.parse(row.childIds) : (row.childIds || [])
    }));

    res.json(parsedRows);
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Login authentication
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
  }

  try {
    const connection = await getDbConnection();
    const [rows] = await connection.query('SELECT * FROM members WHERE username = ? AND password = ?', [username.trim(), password.trim()]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    const member = {
      ...rows[0],
      parentIds: typeof rows[0].parentIds === 'string' ? JSON.parse(rows[0].parentIds) : (rows[0].parentIds || []),
      childIds: typeof rows[0].childIds === 'string' ? JSON.parse(rows[0].childIds) : (rows[0].childIds || [])
    };

    res.json({ message: '로그인 성공', user: member });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Update member details
app.put('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  const member = req.body;

  try {
    const connection = await getDbConnection();
    await connection.query(
      `UPDATE members SET 
        name = ?, gender = ?, birthYear = ?, category = ?, spouseId = ?, 
        parentIds = ?, childIds = ?, groupId = ?, note = ?, profileImage = ?, username = ?, password = ?
       WHERE id = ?`,
      [
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
        member.password,
        id
      ]
    );
    await connection.end();
    res.json({ message: '회원 정보가 수정되었습니다.' });
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3-1. Change password
app.post('/api/members/:id/change-password', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password || password.trim() === '' || password.trim() === '1234') {
    return res.status(400).json({ message: '올바른 비밀번호를 입력해주세요. (1234 제외)' });
  }

  try {
    const connection = await getDbConnection();
    await connection.query(
      'UPDATE members SET password = ? WHERE id = ?',
      [password.trim(), id]
    );
    
    // Get updated user details to return
    const [rows] = await connection.query('SELECT * FROM members WHERE id = ?', [id]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const member = {
      ...rows[0],
      parentIds: typeof rows[0].parentIds === 'string' ? JSON.parse(rows[0].parentIds) : (rows[0].parentIds || []),
      childIds: typeof rows[0].childIds === 'string' ? JSON.parse(rows[0].childIds) : (rows[0].childIds || [])
    };

    res.json({ message: '비밀번호가 변경되었습니다.', user: member });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Create new member (Admin)
app.post('/api/members', async (req, res) => {
  const member = req.body;

  try {
    const connection = await getDbConnection();
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
    await connection.end();
    res.json({ message: '새 회원이 등록되었습니다.' });
  } catch (err) {
    console.error('Error creating member:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete member (Admin)
app.delete('/api/members/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getDbConnection();
    await connection.query('DELETE FROM members WHERE id = ?', [id]);
    await connection.end();
    res.json({ message: '회원이 삭제되었습니다.' });
  } catch (err) {
    console.error('Error deleting member:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Sync all members at once (bulk update from frontend)
app.post('/api/members/sync', async (req, res) => {
  const members = req.body;
  if (!Array.isArray(members)) {
    return res.status(400).json({ message: '올바른 데이터 형식이 아닙니다.' });
  }

  try {
    const connection = await getDbConnection();
    await connection.beginTransaction();

    // Clear and insert all
    await connection.query('DELETE FROM members');
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
          member.username || null,
          member.password || null
        ]
      );
    }

    await connection.commit();
    await connection.end();
    res.json({ message: '성공적으로 동기화되었습니다.' });
  } catch (err) {
    console.error('Error syncing members:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
