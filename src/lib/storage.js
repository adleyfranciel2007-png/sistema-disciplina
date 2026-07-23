// Wrapper around localStorage that never throws silently — callers get a
// boolean/result back so the UI can show an error toast instead of just
// losing data quietly (e.g. private/incognito mode, storage full).

export function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ok: true, value: fallback, isNew: true };
    return { ok: true, value: JSON.parse(raw), isNew: false };
  } catch (e) {
    return { ok: false, value: fallback, error: e };
  }
}

export function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}
