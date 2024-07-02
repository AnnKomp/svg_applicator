// pages/api/defunts.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const client = new Client({
    connectionString: process.env.SECOND_POSTGRES_URL,
  });

  const { nom } = req.body;

  try {
    await client.connect();
    const queryText = `
      SELECT * FROM cimetiere.defunts 
      WHERE upper(nom) LIKE upper($1) 
      OR upper(prenom) LIKE upper($1) 
      OR upper("nomJFille") LIKE upper($1)
    `;
    const result = await client.query(queryText, [`%${nom}%`]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Failed to fetch defunts data.' });
  } finally {
    await client.end();
  }
};
