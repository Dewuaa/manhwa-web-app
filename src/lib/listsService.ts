/**
 * Custom Lists Service
 * Handles CRUD operations for reading lists
 */

import { getSupabaseClient } from './supabase/client';
import {
  CustomList,
  ListItem,
  LocalList,
  LocalListItem,
  DEFAULT_LISTS,
} from './supabase/types';

const LISTS_STORAGE_KEY = 'manhwa_custom_lists';
const LIST_ITEMS_STORAGE_KEY = 'manhwa_list_items';

// ============================================
// LOCAL STORAGE OPERATIONS
// ============================================

/**
 * Get all lists from local storage
 */
export function getLocalLists(): LocalList[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LISTS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Initialize with default lists if empty
    const defaults = createDefaultLocalLists();
    saveLocalLists(defaults);
    return defaults;
  } catch {
    return createDefaultLocalLists();
  }
}

/**
 * Save lists to local storage
 */
export function saveLocalLists(lists: LocalList[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
}

/**
 * Get all list items from local storage
 */
export function getLocalListItems(): LocalListItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LIST_ITEMS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save list items to local storage
 */
export function saveLocalListItems(items: LocalListItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LIST_ITEMS_STORAGE_KEY, JSON.stringify(items));
}

/**
 * Create default lists for local storage
 */
function createDefaultLocalLists(): LocalList[] {
  return DEFAULT_LISTS.map((list, index) => ({
    id: `default-${list.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: list.name,
    description: list.description,
    icon: list.icon,
    color: list.color,
    isDefault: true,
    sortOrder: index,
    createdAt: Date.now(),
  }));
}

/**
 * Add a new local list
 */
export function addLocalList(list: Omit<LocalList, 'id' | 'createdAt'>): LocalList {
  const lists = getLocalLists();
  const newList: LocalList = {
    ...list,
    id: `list-${Date.now()}`,
    createdAt: Date.now(),
  };
  lists.push(newList);
  saveLocalLists(lists);
  return newList;
}

/**
 * Update a local list
 */
export function updateLocalList(id: string, updates: Partial<LocalList>): void {
  const lists = getLocalLists();
  const index = lists.findIndex((l) => l.id === id);
  if (index !== -1) {
    lists[index] = { ...lists[index], ...updates };
    saveLocalLists(lists);
  }
}

/**
 * Delete a local list
 */
export function deleteLocalList(id: string): void {
  const lists = getLocalLists().filter((l) => l.id !== id);
  saveLocalLists(lists);
  // Also remove all items in this list
  const items = getLocalListItems().filter((i) => i.listId !== id);
  saveLocalListItems(items);
}

/**
 * Add item to a local list
 */
export function addItemToLocalList(
  listId: string,
  item: Omit<LocalListItem, 'id' | 'listId' | 'addedAt'>,
): LocalListItem {
  const items = getLocalListItems();

  // Check if already exists
  const exists = items.find((i) => i.listId === listId && i.manhwaId === item.manhwaId);
  if (exists) return exists;

  const newItem: LocalListItem = {
    ...item,
    id: `item-${Date.now()}`,
    listId,
    addedAt: Date.now(),
  };
  items.push(newItem);
  saveLocalListItems(items);
  return newItem;
}

/**
 * Remove item from a local list
 */
export function removeItemFromLocalList(listId: string, manhwaId: string): void {
  const items = getLocalListItems().filter(
    (i) => !(i.listId === listId && i.manhwaId === manhwaId),
  );
  saveLocalListItems(items);
}

/**
 * Get items in a specific list
 */
export function getItemsInLocalList(listId: string): LocalListItem[] {
  return getLocalListItems().filter((i) => i.listId === listId);
}

/**
 * Get all lists that contain a specific manhwa
 */
export function getListsContainingManhwa(manhwaId: string): string[] {
  const items = getLocalListItems();
  return items.filter((i) => i.manhwaId === manhwaId).map((i) => i.listId);
}

/**
 * Move item between lists
 */
export function moveItemToList(
  manhwaId: string,
  fromListId: string,
  toListId: string,
): void {
  const items = getLocalListItems();
  const itemIndex = items.findIndex(
    (i) => i.listId === fromListId && i.manhwaId === manhwaId,
  );

  if (itemIndex !== -1) {
    // Check if already in target list
    const existsInTarget = items.find(
      (i) => i.listId === toListId && i.manhwaId === manhwaId,
    );
    if (!existsInTarget) {
      items[itemIndex].listId = toListId;
      items[itemIndex].addedAt = Date.now();
    } else {
      // Remove from original list if already in target
      items.splice(itemIndex, 1);
    }
    saveLocalListItems(items);
  }
}

// ============================================
// CLOUD OPERATIONS (SUPABASE)
// ============================================

/**
 * Fetch all lists from cloud
 */
export async function fetchCloudLists(userId: string): Promise<CustomList[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_lists')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching lists:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all list items from cloud
 */
export async function fetchCloudListItems(userId: string): Promise<ListItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('list_items')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Error fetching list items:', error);
    return [];
  }

  return data || [];
}

/**
 * Create default lists in cloud for a user
 */
export async function createCloudDefaultLists(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  // Use the database function to create defaults
  const { error } = await supabase.rpc('create_default_lists', { p_user_id: userId });

  if (error) {
    console.error('Error creating default lists:', error);
  }
}

/**
 * Add a list to cloud
 */
export async function addCloudList(
  userId: string,
  list: Omit<CustomList, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
): Promise<CustomList | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_lists')
    .insert({
      user_id: userId,
      name: list.name,
      description: list.description,
      icon: list.icon,
      color: list.color,
      is_default: list.is_default || false,
      sort_order: list.sort_order || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding list:', error);
    return null;
  }

  return data;
}

/**
 * Update a list in cloud
 */
export async function updateCloudList(
  listId: string,
  updates: Partial<
    Pick<CustomList, 'name' | 'description' | 'icon' | 'color' | 'sort_order'>
  >,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from('user_lists').update(updates).eq('id', listId);

  if (error) {
    console.error('Error updating list:', error);
  }
}

/**
 * Delete a list from cloud
 */
export async function deleteCloudList(listId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from('user_lists').delete().eq('id', listId);

  if (error) {
    console.error('Error deleting list:', error);
  }
}

/**
 * Add item to a cloud list
 */
export async function addCloudListItem(
  userId: string,
  listId: string,
  item: { manhwaId: string; title: string; image?: string; notes?: string },
): Promise<ListItem | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('list_items')
    .upsert(
      {
        list_id: listId,
        user_id: userId,
        manhwa_id: item.manhwaId,
        title: item.title,
        image: item.image,
        notes: item.notes,
      },
      { onConflict: 'list_id,manhwa_id' },
    )
    .select()
    .single();

  if (error) {
    console.error('Error adding list item:', error);
    return null;
  }

  return data;
}

/**
 * Remove item from a cloud list
 */
export async function removeCloudListItem(
  listId: string,
  manhwaId: string,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('list_id', listId)
    .eq('manhwa_id', manhwaId);

  if (error) {
    console.error('Error removing list item:', error);
  }
}

// ============================================
// SYNC OPERATIONS
// ============================================

/**
 * Sync lists between local and cloud
 */
export async function syncLists(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  // Fetch cloud lists
  const cloudLists = await fetchCloudLists(userId);

  // If no cloud lists, create defaults and upload local
  if (cloudLists.length === 0) {
    await createCloudDefaultLists(userId);

    // Upload any local custom lists
    const localLists = getLocalLists().filter((l) => !l.isDefault);
    for (const list of localLists) {
      await addCloudList(userId, {
        name: list.name,
        description: list.description,
        icon: list.icon,
        color: list.color,
        is_default: false,
        sort_order: list.sortOrder,
      });
    }
  }

  // Fetch updated cloud lists
  const updatedCloudLists = await fetchCloudLists(userId);
  const cloudItems = await fetchCloudListItems(userId);

  // Convert cloud to local format and save
  const localLists: LocalList[] = updatedCloudLists.map((cl) => ({
    id: cl.id,
    name: cl.name,
    description: cl.description || undefined,
    icon: cl.icon,
    color: cl.color,
    isDefault: cl.is_default,
    sortOrder: cl.sort_order,
    createdAt: new Date(cl.created_at).getTime(),
  }));

  const localItems: LocalListItem[] = cloudItems.map((ci) => ({
    id: ci.id,
    listId: ci.list_id,
    manhwaId: ci.manhwa_id,
    title: ci.title,
    image: ci.image || undefined,
    notes: ci.notes || undefined,
    sortOrder: ci.sort_order,
    addedAt: new Date(ci.added_at).getTime(),
  }));

  // Upload local items that don't exist in cloud
  const localOnlyItems = getLocalListItems();
  for (const localItem of localOnlyItems) {
    const cloudList = updatedCloudLists.find(
      (cl) =>
        cl.name.toLowerCase() ===
        getLocalLists()
          .find((ll) => ll.id === localItem.listId)
          ?.name.toLowerCase(),
    );

    if (cloudList) {
      const existsInCloud = cloudItems.find(
        (ci) => ci.list_id === cloudList.id && ci.manhwa_id === localItem.manhwaId,
      );

      if (!existsInCloud) {
        await addCloudListItem(userId, cloudList.id, {
          manhwaId: localItem.manhwaId,
          title: localItem.title,
          image: localItem.image,
          notes: localItem.notes,
        });
      }
    }
  }

  // Save merged data locally
  saveLocalLists(localLists);
  saveLocalListItems(localItems);
}
