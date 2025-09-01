import { useEffect, useMemo, useState } from 'react';
import { MapView } from './components/MapView';
import { api } from './api/client';

type Book = { id: string; title: string; author: string; isbn?: string };
type Place = { id: string; name: string; lat: number; lng: number };

export default function App() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    api.get(`/health`).then(() => {/* warmup */}).catch(()=>{});
  }, []);

  const doSearch = async () => {
    const res = await api.get<{ items: Book[] }>(`/api/books`, { query });
    setBooks(res.items);
  };

  const nearMe = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await api.get<{ items: Place[] }>(`/api/places/near`, { lat: latitude, lng: longitude, radius: 2000 });
      setPlaces(res.items);
    });
  };

  const markers = useMemo(() => places.map(p => ({ id: p.id, name: p.name, position: [p.lat, p.lng] as [number, number] })), [places]);

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <header style={{ padding: 12, display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <strong>Livres & Lieux</strong>
        <input
          placeholder="Rechercher un livre..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, maxWidth: 420, padding: 8 }}
        />
        <button onClick={doSearch}>Rechercher</button>
        <button onClick={nearMe}>Autour de moi</button>
      </header>
      <MapView markers={markers} />
      <div style={{ position: 'absolute', right: 12, top: 56, background: 'white', padding: 8, borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
        <small>{books.length} livres</small>
      </div>
    </div>
  );
}

