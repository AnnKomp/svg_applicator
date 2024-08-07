
export async function fetchTombesByIds(ids: number[]) {
  try {
    const res = await fetch('/api/tombes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch tombes data.');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw new Error('Failed to fetch tombes data.');
  }
}

export async function fetchSearchDefunts(nom: string) {
  try {
    const res = await fetch('/api/defunts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nom }),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch defunts data.');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw new Error('Failed to fetch defunts data.');
  }
}

export async function fetchSearchDefuntsParTombe(id: number) {
  try {
    const res = await fetch('/api/defuntsParTombe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch defunts data.');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw new Error('Failed to fetch defunts data.');
  }
}

export async function fetchSearchTombes(id: number) {
  try {
    const res = await fetch('/api/searchTombes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch tombes data.');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw new Error('Failed to fetch tombes data.');
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) {
      throw new Error('Failed to fetch categories data.');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw new Error('Failed to fetch categories data.');
  }
}

export async function fetchPersonnesParCategorie(categorie: string) {
  try {
    const res = await fetch(`/api/personnesParCategorie?categorie=${categorie}`);
    if (!res.ok) {
      throw new Error('Failed to fetch personnes data.');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw new Error('Failed to fetch personnes data.');
  }
}

export async function fetchPageSlug(language: string, defunt_id : number) {
  try {
    const res = await fetch(`/api/pageslug?language=${language}&defuntid=${defunt_id}`);
    if (!res.ok) {
      throw new Error('Failed to fetch pageslug data.');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw new Error('Failed to fetch pageslug data.');
  }
}