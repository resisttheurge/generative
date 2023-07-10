import { ThemeUIContextValue, useThemeUI } from 'theme-ui'
import { ExactTheme } from '../theme'

interface ExactContextValue extends Omit<ThemeUIContextValue, 'theme'> {
  theme: ExactTheme
}

export const useTheme = (useThemeUI as unknown) as () => ExactContextValue
