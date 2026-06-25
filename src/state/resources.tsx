// Shared resource store. Every input across every tab reads/writes here, keyed
// by a canonical resource key, so values:
//   1) survive switching tabs (this lives above the tabs and never unmounts), and
//   2) auto-fill anywhere the same resource appears (same key = same value).
// Also mirrored to localStorage so entries survive app restarts.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Values = Record<string, string>
interface Ctx {
  values: Values
  set: (key: string, value: string) => void
  reset: () => void
}

const ResourceCtx = createContext<Ctx | null>(null)
const STORAGE_KEY = 'nte-resources-v1'

export function ResourceProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Values>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
    } catch {
      /* storage unavailable — keep working in-memory */
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
