import { ThemeUIStyleObject } from 'theme-ui'

export const primary: ThemeUIStyleObject = {
  variant: 'text.body',
  p: 1,
  my: 2,
  color: 'primary',
  bg: 'background',
  borderColor: 'primary',
  borderStyle: 'solid',
  borderWidth: '3px',
  '&:hover': {
    bg: 'primary',
    color: 'textInverse'
  }
}

export const secondary: ThemeUIStyleObject = {
  ...primary,
  color: 'secondary',
  borderColor: 'secondary',
  '&:hover': {
    bg: 'secondary',
    color: 'textInverse'
  }
}

export const muted: ThemeUIStyleObject = {
  ...primary,
  color: 'gray',
  borderColor: 'gray',
  bg: 'background',
  '&:hover': {
    bg: 'gray',
    color: 'textInverse'
  }
}

export const icon: ThemeUIStyleObject = {
  fill: 'text',
  bg: 'background',
  borderRadius: '16px',
  p: 1,
  transitionProperty: 'background-color',
  transitionTimingFunction: 'ease-in-out',
  transitionDuration: '.25s',
  '&:hover': {
    bg: 'darkBackground'
  }
}
