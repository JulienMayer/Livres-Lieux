import { useEffect, useMemo, useState } from 'react';
import { MapView } from './components/MapView';
import { AuthModal } from './components/AuthModal';
import { BookList } from './components/BookList';
import { useAuth } from './hooks/useAuth';
import { api } from './api/client';

type Book = { id: string; title: string; author: string; isbn?: string };
type Place = { id: string; name: string; lat: number; lng: number };

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [listPlaces, setListPlaces] = useState<Place[]>([]); // Points de la liste sélectionnée
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Paris par défaut
  
  // États pour la modal d'ajout de livre
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [modalBooks, setModalBooks] = useState<Book[]>([]);
  const [modalPlaces, setModalPlaces] = useState<Place[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
      setMapCenter([latitude, longitude]);
      const res = await api.get<{ items: Place[] }>(`/api/places/near`, { lat: latitude, lng: longitude, radius: 2000 });
      setPlaces(res.items);
    });
  };

  const handlePlaceSelect = (place: Place) => {
    setMapCenter([place.lat, place.lng]);
    setPlaces([place]); // Focus sur ce lieu
  };

  const handleListPlacesUpdate = (places: Place[]) => {
    setListPlaces(places);
  };

  // Fonctions pour la modal d'ajout de livre
  const openAddBookModal = () => {
    setShowAddBookModal(true);
    loadModalBooks();
    loadModalPlaces();
  };

  const closeAddBookModal = () => {
    setShowAddBookModal(false);
    setSelectedBook(null);
    setSelectedPlace(null);
    setNote('');
    setSearchQuery('');
  };

  const loadModalBooks = async () => {
    try {
      const response = await api.get<{ items: Book[] }>('/api/books');
      setModalBooks(response.items);
    } catch (error) {
      console.error('Erreur lors du chargement des livres:', error);
    }
  };

  const loadModalPlaces = async () => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const response = await api.get<{ items: Place[] }>('/api/places/near', {
          lat: latitude,
          lng: longitude,
          radius: 5000
        });
        setModalPlaces(response.items);
      } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error);
      }
    });
  };

  const addBookToList = async () => {
    if (!selectedBook || !selectedPlace || !selectedListId) return;
    
    try {
      await api.post(`/api/lists/${selectedListId}/items`, {
        bookId: selectedBook.id,
        placeId: selectedPlace.id,
        note: note.trim() || undefined
      });
      
      closeAddBookModal();
      
      // Ajouter le nouveau lieu à la liste des points de la liste
      const newPlace = {
        id: selectedPlace.id,
        name: selectedPlace.name,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng
      };
      
      setListPlaces(prev => {
        // Éviter les doublons
        if (prev.some(p => p.id === newPlace.id)) {
          return prev;
        }
        return [...prev, newPlace];
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du livre:', error);
    }
  };

  const markers = useMemo(() => {
    // Combiner les lieux de recherche et les lieux de la liste sélectionnée
    const allPlaces = [...places, ...listPlaces];
    
    return allPlaces.map(p => ({ 
      id: p.id, 
      name: p.name, 
      position: [p.lat, p.lng] as [number, number],
      isFromList: listPlaces.some(lp => lp.id === p.id) // Indiquer si le point vient de la liste
    }));
  }, [places, listPlaces]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="p-3 md:p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Logo/Titre */}
          <div className="flex-shrink-0" style={{ padding: '0.4rem' }}>
            <strong className="text-lg md:text-xl font-bold text-gray-800">📚 Livres & Lieux</strong>
          </div>
          
          {/* Barre de recherche */}
          <div className="flex-1 flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '5rem' , paddingLeft: '5rem'}}>
            <input
              placeholder="Rechercher un livre..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={doSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
            >
              Rechercher
            </button>
            <button 
              onClick={nearMe}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              📍 Autour de moi
            </button>
          </div>

          {/* Authentification */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {user ? (
              <>
                <span className="text-sm md:text-base text-gray-600 truncate hidden sm:block">
                  {user.displayName || user.email}
                </span>
                <button 
                  onClick={() => signOut()}
                  className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                  style={{ gap: '0.5rem' }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Connexion
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-row min-h-0 h-full">
      {/* Modal d'ajout de livre */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'white', width: '20rem' }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">📚 Ajouter un livre à la liste</h2>
                <button
                  onClick={closeAddBookModal}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  ✕
                </button>
              </div>

              {/* Contenu de la modal */}
              <div className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {/* Sélection du livre */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm" style={{ marginRight: '0.5rem' }}>1.</span>
                    Choisir un livre
                  </h3>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="🔍 Rechercher un livre par titre ou auteur..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto bg-gray-50 p-2 rounded-lg">
                    {modalBooks
                      .filter(book =>
                        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        book.author.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((book) => (
                        <div
                          key={book.id}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md bg-white flex flex-col justify-between ${
                            selectedBook?.id === book.id 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedBook(book)}
                          style={{ minHeight: '90px' }}
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 text-sm mb-1 truncate">
                              {book.title}
                            </div>
                            <div className="text-xs text-gray-600 mb-2 truncate">
                              {book.author}
                            </div>
                          </div>
                          {book.isbn && (
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-auto">
                              📖 ISBN: {book.isbn}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Sélection du lieu */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-sm" style={{ marginRight: '0.5rem' }}>2.</span>
                    Choisir un lieu
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto bg-gray-50 p-2 rounded-lg">
                    {modalPlaces.map((place) => (
                      <div
                        key={place.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md bg-white flex flex-col justify-between ${
                          selectedPlace?.id === place.id 
                            ? 'border-green-500 bg-green-50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPlace(place)}
                        style={{ minHeight: '80px' }}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-sm mb-1 truncate">
                            📍 {place.name}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {modalPlaces.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📍</div>
                        <p className="text-sm">Aucun lieu à proximité trouvé</p>
                        <p className="text-xs">Autorisez la géolocalisation pour voir les lieux proches</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Note optionnelle */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-sm" style={{ marginRight: '0.5rem' }}>3.</span>
                    Note (optionnel)
                  </h3>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="💭 Ajouter une note sur ce livre et ce lieu..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-600">
                    {selectedBook && selectedPlace ? (
                      <span className="text-green-600">✅ Prêt à ajouter : {selectedBook.title} à {selectedPlace.name}</span>
                    ) : (
                      <span>⚠️ Sélectionnez un livre et un lieu</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={closeAddBookModal}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={addBookToList}
                      disabled={!selectedBook || !selectedPlace}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm"
                    >
                      ✅ Ajouter à la liste
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        {/* Sidebar pour les utilisateurs connectés */}
        {user && (
          <div className="w-80 xl:w-96 border-r border-gray-200 bg-gray-50 flex-shrink-0" style={{ width: '20rem' , paddingRight: '1rem'}}>
            <div className="h-full overflow-y-auto">
              <BookList 
                user={user} 
                onPlaceSelect={handlePlaceSelect}
                onListSelect={setSelectedListId}
                onListPlacesUpdate={handleListPlacesUpdate}
                onAddBook={openAddBookModal}
              />
            </div>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative min-h-0 h-full min-h-[400px] overflow-hidden">
          {/* Info panel */}
          <div className="absolute bottom-4 left-4 bg-white text-black p-3 md:p-4 z-1000 shadow-lg rounded-lg border border-gray-600" style={{ backgroundColor: 'white', bottom: 0 }}>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="font-semibold bg-blue-600 text-white px-2 py-1 rounded text-xs" style={{ marginRight: '0.5rem' }}>
                  📚 {books.length} livre(s),
                </div>
                <div className="font-semibold bg-green-600 px-2 py-1 rounded text-xs" style={{ marginRight: '0.5rem' }}>
                  📍 {places.length} lieu(x),
                </div>
                {listPlaces.length > 0 && (
                  <div className="font-semibold bg-red-600 px-2 py-1 rounded text-xs" style={{ marginRight: '0.5rem' }}>
                    🔴 {listPlaces.length} liste
                  </div>
                )}
              </div>
              {!user && (
                <div className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
                  Connectez-vous pour créer vos listes !
                </div>
              )}
            </div>
          </div>
          <MapView markers={markers} center={mapCenter} />
        </div>
      </div>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

