// pages/api/personnesParCategorie.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const client = new Client({
    connectionString: process.env.SECOND_POSTGRES_URL,
  });

  const { categorie } = req.query;

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM defunts d WHERE categorie = $1 and celebrite = true', [categorie]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Failed to fetch personnes data.' });
  } finally {
    await client.end();
  }
};