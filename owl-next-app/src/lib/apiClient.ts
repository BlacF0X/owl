function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined in the environment variables.');
  }
  return baseUrl;
}

/**
 * Un client de fetch sécurisé et typé pour interagir avec votre API backend.
 * @param endpoint Le chemin de l'API à appeler (ex: '/api/sensors').
 * @param token Le token d'authentification JWT de l'utilisateur.
 * @param options Les options de la requête fetch.
 * @returns Une promesse qui se résout avec les données JSON typées.
 */
export async function fetchFromApi<T>(
  endpoint: string,
  token: string | null, // Le token est maintenant un argument
  options: RequestInit = {}
): Promise<T> {
  if (!token) {
    throw new Error('An authentication token is required for this request.');
  }

  const apiUrl = getApiBaseUrl();
  const url = `${apiUrl}${endpoint}`;

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // On utilise le token reçu
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`API request failed: ${errorBody.message || response.statusText}`);
  }

  return response.json() as Promise<T>;
}
