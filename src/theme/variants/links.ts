import { ThemeUIStyleObject } from 'theme-ui'

export const nav: ThemeUIStyleObject = {
  variant: 'text.bold',
  flex: 1,
  textAlign: 'center',
  p: 0,
  color: 'text',
  '&:active': {
    color: 'primary',
  },
  '&:hover': {
    color: 'secondary',
  },
}
