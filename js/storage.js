const STORAGE_KEY = 'loom.state.v1';

function generateId() {
  return Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load state:', err);
    return [];
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn('Failed to save state:', err);
    return false;
  }
}

export function addEntry(entry) {
  const state = loadState();
  const e = { id: entry.id || generateId(), ...entry };
  state.push(e);
  saveState(state);
  return e;
}

export function removeEntry(id) {
  const state = loadState();
  const idx = state.findIndex(s => s.id === id);
  if (idx === -1) return false;
  state.splice(idx, 1);
  saveState(state);
  return true;
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('loom.order.v1');
  } catch (err) {
    console.warn('Failed to clear state:', err);
  }
}

export function updateEntryOrder(order) {
  try {
    localStorage.setItem('loom.order.v1', JSON.stringify(order));
  } catch (err) {
    console.warn('Failed to save order:', err);
  }
}

export function getEntryOrder() {
  try {
    const raw = localStorage.getItem('loom.order.v1');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Failed to load order:', err);
    return null;
  }
}

export default { loadState, saveState, addEntry, removeEntry, clearState, updateEntryOrder, getEntryOrder };