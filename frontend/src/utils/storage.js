// All data stored in localStorage — no backend needed

const KEYS = {
  DRAFTS: 'lawmind_drafts',
  USER: 'lawmind_user',
  SETTINGS: 'lawmind_settings',
};

// Auto-generate IDs
const genId = () => Date.now() + Math.random().toString(36).slice(2, 7);

// ── USER ──────────────────────────────────────────────────────
export const getUser = () => {
  const stored = localStorage.getItem(KEYS.USER);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  // Default guest user so app works without login
  const guest = {
    id: 'guest',
    full_name: 'Guest Advocate',
    email: 'guest@lawmind.local',
    organization: 'LawMind',
    role: 'advocate',
  };
  localStorage.setItem(KEYS.USER, JSON.stringify(guest));
  return guest;
};

export const setUser = (user) => localStorage.setItem(KEYS.USER, JSON.stringify(user));
export const clearUser = () => localStorage.removeItem(KEYS.USER);

// ── DRAFTS ────────────────────────────────────────────────────
export const getDrafts = () => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.DRAFTS)) || [];
  } catch {
    return [];
  }
};

export const getDraft = (id) =>
  getDrafts().find((d) => String(d.id) === String(id)) || null;

export const saveDraft = (draftData) => {
  const drafts = getDrafts();
  const now = new Date().toISOString();

  if (draftData.id) {
    // Update existing
    const idx = drafts.findIndex((d) => String(d.id) === String(draftData.id));
    if (idx >= 0) {
      drafts[idx] = { ...drafts[idx], ...draftData, updated_at: now };
      localStorage.setItem(KEYS.DRAFTS, JSON.stringify(drafts));
      return drafts[idx];
    }
  }

  // Create new
  const newDraft = {
    id: genId(),
    ...draftData,
    citations: draftData.citations || [],
    version: 1,
    created_at: now,
    updated_at: now,
  };
  drafts.unshift(newDraft);
  localStorage.setItem(KEYS.DRAFTS, JSON.stringify(drafts));
  return newDraft;
};

export const deleteDraft = (id) => {
  const drafts = getDrafts().filter((d) => String(d.id) !== String(id));
  localStorage.setItem(KEYS.DRAFTS, JSON.stringify(drafts));
};

export const updateDraftContent = (id, content) =>
  saveDraft({ id, content, updated_at: new Date().toISOString() });

// ── SETTINGS ──────────────────────────────────────────────────
export const getSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.SETTINGS)) || {};
  } catch {
    return {};
  }
};

export const saveSettings = (s) =>
  localStorage.setItem(
    KEYS.SETTINGS,
    JSON.stringify({ ...getSettings(), ...s })
  );
