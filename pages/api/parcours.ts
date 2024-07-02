// pages/api/parcours.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM parcours');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Failed to fetch parcours data.' });
  } finally {
    await client.end();
  }
};
