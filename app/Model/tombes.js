import {query} from '@/lib/db';


export async function getTombesByCategory(nomCategory) {
    const results = await query(
        `
        SELECT x, y, vertical FROM cimetiere.tombes
        WHERE categorie = ?;
    `,
    nomCategory,
    );
    return JSON.parse(JSON.stringify(results));
}
