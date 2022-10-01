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
  p: 1,
  ml: [0, 2, 4],
  mr: [0, 2, 4]
}
