const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorBody}`);
  }
  
  return response.json();
}
