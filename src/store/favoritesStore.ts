import { create } from 'zustand';

interface FavoritesStore {
  ids: number[];
  toggle: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

const load = (): number[] => {
  try {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  } catch {
    return [];
  }
};

const save = (ids: number[]) => {
  localStorage.setItem('favorites', JSON.stringify(ids));
};

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  ids: load(),
  toggle: (id) => {
    const ids = get().ids;
    const next = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
    save(next);
    set({ ids: next });
  },
  isFavorite: (id) => get().ids.includes(id),
}));
