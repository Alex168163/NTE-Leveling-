// Shared resource store. Every input across every tab reads/writes here, keyed
// by a canonical resource key, so values:
//   1) survive switching tabs (this lives above the tabs and never unmounts),
//   2) auto-fill anywhere the same resource appears (same key = same value), and
//   3) survive closing/reopening the program.
//
// Persistence: in the desktop app we save to a JSON file in the user-data folder
// (via the preload `nte.store` bridge) — reliable across restarts. On the web we
// fall back to localStorage. We always mirror to localStorage too as a backup.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type Values = Record<string, string>
interface Ctx {
  values: Values
  set: (key: string, value: string) => void
  reset: () => void
}

// Minimal shape of the bridge exposed by electron/preload.cjs.
declare global {
  interface Window {
    nte?: {
      store?: {
        loadSync: () => string
        save: (json: string) => void
        saveSync?: (json: string) => void
      }
    }
  }
}

const ResourceCtx = createContext<Ctx | null>(null)
const STORAGE_KEY = 'nte-resources-v1'

function loadInitial(): Values {
  try {
    const raw =
      window.nte?.store?.loadSync?.() ?? localStorage.getItem(STORAGE_KEY) ?? '{}'
    return JSON.parse(raw || '{}')
  } catch {
    return {}
  }
}

export function ResourceProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Values>(loadInitial)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef<Values>(values)
  latest.current = values

  // Flush immediately when the window is closing, so the last edits (possibly
  // still inside the debounce window) are never lost.
  useEffect(() => {
    const flush = () => {
      const json = JSON.stringify(latest.current)
      try {
        window.nte?.store?.saveSync?.(json)
      } catch {
        /* ignore */
      }
      try {
        localStorage.setItem(STORAGE_KEY, json)
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('beforeunload', flush)
    return () => window.removeEventListener('beforeunload', flush)
  }, [])

  // Debounced persist to the file bridge (and localStorage backup).
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const json = JSON.stringify(values)
      try {
        window.nte?.store?.save?.(json)
      } catch {
        /* bridge unavailable */
      }
      try {
        localStorage.setItem(STORAGE_KEY, json)
      } catch {
        /* storage unavailable — keep working in-memory */
      }
    }, 200)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [values])

  const set = (key: string, value: string) => setValues((p) => ({ ...p, [key]: value }))
  const reset = () => setValues({})

  return <ResourceCtx.Provider value={{ values, set, reset }}>{children}</ResourceCtx.Provider>
}

export function useResources(): Ctx {
  const ctx = useContext(ResourceCtx)
  if (!ctx) throw new Error('useResources must be used within ResourceProvider')
  return ctx
}
