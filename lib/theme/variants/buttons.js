export const primary = {
  variant: 'text.body',
  p: 2,
  m: 2,
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

export const secondary = {
  ...primary,
  color: 'secondary',
  borderColor: 'secondary',
  '&:hover': {
    bg: 'secondary',
    color: 'textInverse'
  }
}

export const muted = {
  ...primary,
  color: 'gray',
  borderColor: 'gray',
  bg: 'background',
  '&:hover': {
    bg: 'gray',
    color: 'textInverse'
  }
}
