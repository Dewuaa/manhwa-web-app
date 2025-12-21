'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LocalList, LocalListItem } from '@/lib/supabase/types';
import {
  getLocalLists,
  getLocalListItems,
  addLocalList,
  updateLocalList,
  deleteLocalList,
  addItemToLocalList,
  removeItemFromLocalList,
  syncLists,
  addCloudList,
  updateCloudList,
  deleteCloudList,
  addCloudListItem,
  removeCloudListItem,
} from '@/lib/listsService';

interface ListsContextType {
  // State
  lists: LocalList[];
  isLoading: boolean;

  // List operations
  createList: (
    name: string,
    description?: string,
    icon?: string,
    color?: string,
  ) => Promise<LocalList | null>;
  editList: (
    id: string,
    updates: Partial<Pick<LocalList, 'name' | 'description' | 'icon' | 'color'>>,
  ) => Promise<void>;
  removeList: (id: string) => Promise<void>;

  // Item operations
  addToList: (
    listId: string,
    manhwa: { id: string; title: string; image?: string },
  ) => Promise<void>;
  removeFromList: (listId: string, manhwaId: string) => Promise<void>;
  getListItems: (listId: string) => LocalListItem[];
  getManhwaLists: (manhwaId: string) => string[];
  isInList: (listId: string, manhwaId: string) => boolean;
  isInAnyList: (manhwaId: string) => boolean;

  // Bulk operations
  setManhwaLists: (
    manhwaId: string,
    manhwaTitle: string,
    manhwaImage: string | undefined,
    listIds: string[],
  ) => Promise<void>;

  // Sync
  refreshLists: () => Promise<void>;
}

const ListsContext = createContext<ListsContextType | undefined>(undefined);

export function ListsProvider({ children }: { children: ReactNode }) {
  const { user, isConfigured } = useAuth();
  // Use lazy initialization to avoid setState in useEffect
  const [lists, setLists] = useState<LocalList[]>(() => getLocalLists());
  const [listItems, setListItems] = useState<LocalListItem[]>(() => getLocalListItems());
  const [isLoading, setIsLoading] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  const isCloudEnabled = Boolean(user && isConfigured);

  // Sync with cloud in background (slow, but non-blocking)
  useEffect(() => {
    if (!isCloudEnabled || !user || hasSynced) return;

    const syncInBackground = async () => {
      try {
        await syncLists(user.id);
        // Update state with synced data
        setLists(getLocalLists());
        setListItems(getLocalListItems());
        setHasSynced(true);
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    };

    // Delay sync slightly to not block initial render
    const timer = setTimeout(syncInBackground, 500);
    return () => clearTimeout(timer);
  }, [isCloudEnabled, user, hasSynced]);

  // Refresh lists from storage
  const refreshLists = useCallback(async () => {
    if (isCloudEnabled && user) {
      await syncLists(user.id);
    }
    setLists(getLocalLists());
    setListItems(getLocalListItems());
  }, [isCloudEnabled, user]);

  // Create a new list
  const createList = useCallback(
    async (
      name: string,
      description?: string,
      icon: string = 'list',
      color: string = 'blue',
    ): Promise<LocalList | null> => {
      // Check for duplicate name
      if (lists.some((l) => l.name.toLowerCase() === name.toLowerCase())) {
        return null;
      }

      const newList = addLocalList({
        name,
        description,
        icon,
        color,
        isDefault: false,
        sortOrder: lists.length,
      });

      // Sync to cloud
      if (isCloudEnabled && user) {
        await addCloudList(user.id, {
          name,
          description: description || null,
          icon,
          color,
          is_default: false,
          sort_order: lists.length,
        });
      }

      setLists(getLocalLists());
      return newList;
    },
    [lists, isCloudEnabled, user],
  );

  // Edit a list
  const editList = useCallback(
    async (
      id: string,
      updates: Partial<Pick<LocalList, 'name' | 'description' | 'icon' | 'color'>>,
    ): Promise<void> => {
      updateLocalList(id, updates);

      if (isCloudEnabled) {
        await updateCloudList(id, {
          name: updates.name,
          description: updates.description,
          icon: updates.icon,
          color: updates.color,
        });
      }

      setLists(getLocalLists());
    },
    [isCloudEnabled],
  );

  // Remove a list
  const removeList = useCallback(
    async (id: string): Promise<void> => {
      const list = lists.find((l) => l.id === id);
      if (list?.isDefault) return; // Can't delete default lists

      deleteLocalList(id);

      if (isCloudEnabled) {
        await deleteCloudList(id);
      }

      setLists(getLocalLists());
      setListItems(getLocalListItems());
    },
    [lists, isCloudEnabled],
  );

  // Add manhwa to a list
  const addToList = useCallback(
    async (
      listId: string,
      manhwa: { id: string; title: string; image?: string },
    ): Promise<void> => {
      addItemToLocalList(listId, {
        manhwaId: manhwa.id,
        title: manhwa.title,
        image: manhwa.image,
      });

      if (isCloudEnabled && user) {
        await addCloudListItem(user.id, listId, {
          manhwaId: manhwa.id,
          title: manhwa.title,
          image: manhwa.image,
        });
      }

      setListItems(getLocalListItems());
    },
    [isCloudEnabled, user],
  );

  // Remove manhwa from a list
  const removeFromList = useCallback(
    async (listId: string, manhwaId: string): Promise<void> => {
      removeItemFromLocalList(listId, manhwaId);

      if (isCloudEnabled) {
        await removeCloudListItem(listId, manhwaId);
      }

      setListItems(getLocalListItems());
    },
    [isCloudEnabled],
  );

  // Get items in a specific list
  const getListItemsHandler = useCallback(
    (listId: string): LocalListItem[] => {
      return listItems.filter((i) => i.listId === listId);
    },
    [listItems],
  );

  // Get all lists containing a manhwa
  const getManhwaListsHandler = useCallback(
    (manhwaId: string): string[] => {
      return listItems.filter((i) => i.manhwaId === manhwaId).map((i) => i.listId);
    },
    [listItems],
  );

  // Check if manhwa is in a specific list
  const isInList = useCallback(
    (listId: string, manhwaId: string): boolean => {
      return listItems.some((i) => i.listId === listId && i.manhwaId === manhwaId);
    },
    [listItems],
  );

  // Check if manhwa is in any list
  const isInAnyList = useCallback(
    (manhwaId: string): boolean => {
      return listItems.some((i) => i.manhwaId === manhwaId);
    },
    [listItems],
  );

  // Set which lists a manhwa belongs to (bulk update)
  const setManhwaLists = useCallback(
    async (
      manhwaId: string,
      manhwaTitle: string,
      manhwaImage: string | undefined,
      listIds: string[],
    ): Promise<void> => {
      const currentLists = getManhwaListsHandler(manhwaId);

      // Remove from lists that are no longer selected
      for (const listId of currentLists) {
        if (!listIds.includes(listId)) {
          await removeFromList(listId, manhwaId);
        }
      }

      // Add to newly selected lists
      for (const listId of listIds) {
        if (!currentLists.includes(listId)) {
          await addToList(listId, {
            id: manhwaId,
            title: manhwaTitle,
            image: manhwaImage,
          });
        }
      }
    },
    [getManhwaListsHandler, removeFromList, addToList],
  );

  const value: ListsContextType = {
    lists,
    isLoading,
    createList,
    editList,
    removeList,
    addToList,
    removeFromList,
    getListItems: getListItemsHandler,
    getManhwaLists: getManhwaListsHandler,
    isInList,
    isInAnyList,
    setManhwaLists,
    refreshLists,
  };

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

export function useLists() {
  const context = useContext(ListsContext);
  if (context === undefined) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return context;
}
