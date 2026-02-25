import * as storage from './storage';

// Mock axios-like API that works entirely from localStorage — no backend needed

const api = {
  get: async (url) => {
    if (url === '/drafts/' || url === '/drafts') return { data: storage.getDrafts() };
    if (url === '/auth/me') return { data: storage.getUser() };
    const draftMatch = url.match(/^\/drafts\/([^/?]+)$/);
    if (draftMatch) {
      const id = draftMatch[1];
      const draft = storage.getDraft(id);
      if (!draft) {
        const err = new Error('Draft not found');
        err.response = { status: 404, data: { detail: 'Draft not found' } };
        throw err;
      }
      return { data: draft };
    }
    return { data: null };
  },

  post: async (url, body) => {
    if (url === '/auth/login') {
      const user = {
        id: 'user_1',
        full_name: body?.full_name || body?.email?.split('@')[0] || 'Advocate',
        email: body?.email || 'user@lawmind.local',
        organization: body?.organization || '',
      };
      storage.setUser(user);
      return { data: { access_token: 'local', token_type: 'bearer', user } };
    }
    if (url === '/auth/register') {
      const user = {
        id: 'user_1',
        full_name: body?.full_name || 'Advocate',
        email: body?.email,
        organization: body?.organization || '',
      };
      storage.setUser(user);
      return { data: user };
    }
    if (url === '/drafts/generate') {
      // Draft generation is handled directly by Gemini in NewDraft.js — this is fallback
      const draft = storage.saveDraft({
        ...body,
        content: body.content || '(Generating...)',
        status: 'draft',
      });
      return { data: draft };
    }
    return { data: {} };
  },

  put: async (url, body) => {
    const draftMatch = url.match(/^\/drafts\/([^/?]+)$/);
    if (draftMatch) {
      const id = draftMatch[1];
      const updated = storage.saveDraft({
        id,
        content: typeof body === 'string' ? body : body?.content ?? '',
        updated_at: new Date().toISOString(),
      });
      return { data: updated };
    }
    return { data: {} };
  },

  delete: async (url) => {
    const draftMatch = url.match(/^\/drafts\/([^/?]+)$/);
    if (draftMatch) {
      const id = draftMatch[1];
      storage.deleteDraft(id);
      return { data: {} };
    }
    return { data: {} };
  },

  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
};

export default api;
