import { ThemeUIStyleObject } from 'theme-ui'

export const root: ThemeUIStyleObject = {
  variant: 'text.body',
  fontSize: '16px',
  boxSizing: 'border-box',
  p: 0,
  m: 0,
  overflowX: 'hidden',
  overflowY: 'hidden',

  '*:focus-visible': {
    outline: t => `thin solid ${t.colors.primary}`
  }
}
