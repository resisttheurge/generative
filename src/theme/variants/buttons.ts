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
    color: 'textInverse',
  },
}

export const secondary: ThemeUIStyleObject = {
  ...primary,
  color: 'secondary',
  borderColor: 'secondary',
  '&:hover': {
    bg: 'secondary',
    color: 'textInverse',
  },
}

export const muted: ThemeUIStyleObject = {
  ...primary,
  color: 'gray',
  borderColor: 'gray',
  bg: 'background',
  '&:hover': {
    bg: 'gray',
    color: 'textInverse',
  },
}

export const icon: ThemeUIStyleObject = {
  p: 0,
  size: 'fit-content',
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridTemplateRows: '1fr',
  gridTemplateAreas: '"center"',
  placeItems: 'center',
  fontSize: 'inherit',
  transition: 'activate',
  overflow: 'clip',
  borderRadius: '9999px',
  ':hover': {
    boxShadow: 'button',
    zIndex: '1',
  },
  '& > *': {
    gridArea: 'center',
  },
}

export const tint: ThemeUIStyleObject = {
  alignSelf: 'stretch',
  justifySelf: 'stretch',
  transition: 'activate',
  ':hover': {
    bg: 'lightShadow',
  },
}

export const fab: ThemeUIStyleObject = {
  variant: 'buttons.icon',
  bg: 'background',
  boxShadow: 'fab',
  m: [4, 3, 2],
}
