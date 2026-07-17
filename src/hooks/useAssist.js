import { useState, useCallback } from 'react';

/**
 * Custom React hook to communicate with the server-side GenAI proxy.
 * 
 * @returns {{
 *   loading: boolean,
 *   error: string|null,
 *   data: string|null,
 *   run: (feature: string, role: string, payload: object) => Promise<void>
 * }}
 */
export function useAssist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const run = useCallback(async (feature, role, payload) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feature, role, payload })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Request failed with status ${response.status}`);
      }

      const resData = await response.json();
      setData(resData.text || 'No output text returned.');
    } catch (err) {
      console.error('[useAssist hook error]:', err);
      setError(err.message || 'Unable to connect to safety assistant.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, data, run };
}
