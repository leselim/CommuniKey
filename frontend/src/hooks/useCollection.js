import { useCallback, useEffect, useState } from 'react';
import { fetchCollection, save } from '../services/api';

/**
 * Loads a collection from the REST API described in docs/12_API_DESIGN.md.
 *
 * The API is the source of truth when it responds. While the backend routes
 * are still scaffolds the hook keeps the supplied fallback data and applies
 * changes locally, so every screen stays usable during development.
 *
 * @param {string} path    API path, e.g. "/incidents"
 * @param {Array}  fallback Local data used until the endpoint responds
 */
export default function useCollection(path, fallback) {
  const [items, setItems] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchCollection(path).then((data) => {
      if (!active) return;
      if (data) {
        setItems(data);
        setLive(true);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [path]);

  /** Adds a record optimistically, then reconciles with the saved resource. */
  const create = useCallback(
    async (draft) => {
      const local = { ...draft, id: `local-${Date.now()}` };
      setItems((prev) => [local, ...prev]);

      const saved = await save(path, draft);
      if (saved && saved.id) {
        setItems((prev) => prev.map((item) => (item.id === local.id ? saved : item)));
      }
      return saved || local;
    },
    [path]
  );

  /** Applies changes to a record and mirrors them to the API when available. */
  const update = useCallback(
    async (id, changes) => {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));
      await save(`${path}/${id}`, changes, 'put');
    },
    [path]
  );

  return { items, loading, live, create, update, setItems };
}
