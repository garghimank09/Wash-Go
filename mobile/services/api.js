import { API_URL } from '../lib/apiConfig';
import { getToken } from '../lib/sessionStore';
import { parseErrorDetail } from './apiClient';

export { API_URL, parseErrorDetail };

export async function getAuthHeaders() {
  const token = await getToken();
  if (!token) {
    throw new Error('Not signed in. Please log in again.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
