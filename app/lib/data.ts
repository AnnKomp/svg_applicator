
export async function fetchPersonnes() {
  try {
    const res = await fetch('/api/personnes');
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

export async function fetchPersonnesParParcours(idparcours: number) {
  try {
    const res = await fetch(`/api/personnesParParcours?idparcours=${idparcours}`);
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

export async function fetchParcours() {
  try {
    const res = await fetch('/api/parcours');
    if (!res.ok) {
      throw new Error('Failed to fetch parcours data.');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw new Error('Failed to fetch parcours data.');
  }
}

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