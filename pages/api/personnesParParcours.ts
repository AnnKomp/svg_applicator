// pages/api/personnesParParcours.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  const { idparcours } = req.query;

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM personne pe JOIN liason l ON pe.id = l.idpersonne WHERE idparcours = $1', [idparcours]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Failed to fetch personne data.' });
  } finally {
    await client.end();
  }
};
