import { ThemeUIStyleObject } from 'theme-ui'
import { code } from './code'

export const pre: ThemeUIStyleObject = {
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
