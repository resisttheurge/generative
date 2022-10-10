import chroma from 'chroma-js'

export const primary = {
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

export const icon = {
  fill: 'text',
  bg: 'background',
  borderRadius: 16,
  transitionProprty: 'background-color',
  transitionTimingFunction: 'ease-out',
  transitionDuration: '.2s',
  '&:hover': {
    bg: t => chroma(t.rawColors.background).darken().hex()

  }
}
