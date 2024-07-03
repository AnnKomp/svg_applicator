// pages/api/pageslug.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const client = new Client({
    connectionString: process.env.SECOND_POSTGRES_URL,
  });

  const { language, defuntid } = req.query;

  try {
    await client.connect();
    const result = await client.query('SELECT "pageSlug" FROM cimetiere.pagecontent p WHERE language = $1 AND p.defunt_id = $2', [language, defuntid]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Failed to fetch pageslug data.' });
  } finally {
    await client.end();
  }
};