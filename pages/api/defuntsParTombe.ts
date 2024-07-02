// pages/api/defuntsParTombe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const client = new Client({
    connectionString: process.env.SECOND_POSTGRES_URL,
  });

  const { id } = req.body;

  try {
    await client.connect();
    const queryText = 'SELECT * FROM cimetiere.defunts WHERE tombe = $1';
    const result = await client.query(queryText, [id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Failed to fetch defunts data.' });
  } finally {
    await client.end();
  }
};
