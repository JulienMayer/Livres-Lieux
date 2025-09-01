import { useState, useEffect } from 'react';
import { api } from '../api/client';

type Book = { 
  id: string; 
  title: string; 
  author: string; 
  isbn?: string;
  createdAt: string;
};

type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

type List = {
  id: string;
  name: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  userId?: string;
  items: ListItem[];
  createdAt: string;
  updatedAt: string;
};

type ListItem = {
  id: string;
  bookId: string;
  placeId: string;
  note?: string;
  book: Book;
  place: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  };
};

interface BookListProps {
  user: { id: string };
  onPlaceSelect: (place: { id: string; name: string; lat: number; lng: number }) => void;
  onListSelect: (listId: string | null) => void;
  onListPlacesUpdate: (places: { id: string; name: string; lat: number; lng: number }[]) => void;
  onAddBook: () => void;
}

export function BookList({ user, onPlaceSelect, onListSelect, onListPlacesUpdate, onAddBook }: BookListProps) {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(true);
  


  // Charger les listes au démarrage
  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    setListsLoading(true);
    try {
      const response = await api.get<{ items: List[] }>('/api/lists');
      setLists(response.items);
      
      // Si c'est la première fois, sélectionner la première liste
      if (response.items.length > 0 && !selectedList) {
        await loadListDetails(response.items[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des listes:', error);
    } finally {
      setListsLoading(false);
    }
  };

  const createList = async () => {
    if (!newListName.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.post('/api/lists', {
        name: newListName,
        visibility: 'PRIVATE'
      });
      setNewListName('');
      await loadLists();
    } catch (error) {
      console.error('Erreur lors de la création de la liste:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadListDetails = async (listId: string) => {
    try {
      const response = await api.get<List>(`/api/lists/${listId}`);
      setSelectedList(response);
      onListSelect(listId);
      
      // Extraire les lieux de la liste et les envoyer au parent
      const listPlaces = response.items?.map(item => ({
        id: item.place.id,
        name: item.place.name,
        lat: item.place.lat,
        lng: item.place.lng
      })) || [];
      
      onListPlacesUpdate(listPlaces);
    } catch (error) {
      console.error('Erreur lors du chargement de la liste:', error);
    }
  };

  const deleteListItem = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre de la liste ?')) return;
    
    try {
      await api.delete(`/api/lists/${selectedList?.id}/items/${itemId}`);
      if (selectedList) {
        await loadListDetails(selectedList.id);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du livre:', error);
    }
  };

  const deleteList = async (listId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette liste ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      await api.delete(`/api/lists/${listId}`);
      setSelectedList(null);
      onListSelect(null);
      onListPlacesUpdate([]); // Effacer les points de la carte
      await loadLists();
    } catch (error) {
      console.error('Erreur lors de la suppression de la liste:', error);
    }
  };



  if (listsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des listes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">📚 Mes Listes</h2>
          
          {/* Créer une nouvelle liste */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Nouvelle liste..."
              className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              onKeyPress={(e) => e.key === 'Enter' && createList()}
            />
            <button
              onClick={createList}
              disabled={loading || !newListName.trim()}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm"
            >
              {loading ? '⏳' : '➕'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des listes */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 md:space-y-4">
          {lists.map((list) => (
            <div
              key={list.id}
              className={`p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedList?.id === list.id 
                  ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
                  : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-md'
              }`}
              onClick={() => loadListDetails(list.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-base md:text-lg truncate">{list.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {list.items?.length || 0} livre(s) • {list.visibility === 'PRIVATE' ? '🔒 Privé' : '🌍 Public'}
                  </p>
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {new Date(list.updatedAt).toLocaleDateString('fr-FR')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteList(list.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors duration-200"
                    title="Supprimer cette liste"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Aperçu des livres dans la liste */}
              {list.items && list.items.length > 0 && (
                <div className="mt-3 space-y-2">
                  {list.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 md:p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs md:text-sm text-gray-800 truncate">
                          {item.book.title}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {item.book.author} • 📍 {item.place.name}
                        </div>
                      </div>
                    </div>
                  ))}
                  {list.items.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{list.items.length - 3} autre(s) livre(s)
                    </div>
                  )}
                </div>
              )}

              {list.items?.length === 0 && (
                <div className="mt-3 p-3 md:p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-xs md:text-sm text-gray-500 text-center">Aucun livre dans cette liste</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {lists.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl md:text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-sm md:text-base">Aucune liste créée</p>
            <p className="text-xs md:text-sm text-gray-400">Créez votre première liste ci-dessus !</p>
          </div>
        )}
      </div>

      {/* Nom de la liste sélectionnée */}
      {selectedList && (
        <div className="mt-4 md:mt-6 p-3 md:p-4 bg-white border-t-2 border-gray-300 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">
              📖 {selectedList.name}
            </h3>
            <button
              onClick={onAddBook}
              className="px-2 md:px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-xs md:text-sm font-medium flex items-center gap-1"
            >
              ➕ Ajouter
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
}
