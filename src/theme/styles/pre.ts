import { code } from './code'

export const pre = {
  borderRadius: '4px',
  fontFamily: 'monospace',
  overflowX: 'auto',
  fontSize: 2,
  code: {
    ...code,
    color: 'inherit',
    fontSize: 'inherit'
  },
  px: 1,
  mx: 0
}
