const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

type Query = Record<string, string | number | boolean | undefined>;

function qs(params?: Query) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return;
    sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const api = {
  async get<T>(path: string, params?: Query): Promise<T> {
    const res = await fetch(`${base}${path}${qs(params)}`);
    if (!res.ok) throw new Error(`GET ${path} failed`);
    return res.json();
  },
  async post<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`POST ${path} failed`);
    return res.json();
  },
};

