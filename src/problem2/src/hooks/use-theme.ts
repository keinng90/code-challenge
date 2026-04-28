import { useContext } from 'react'
import { ThemeContext } from '@/components/theme-provider'

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
