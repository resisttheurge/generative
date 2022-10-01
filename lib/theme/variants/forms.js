export const form = {
  variant: 'text.body',
  fontSize: 0,
  borderRadius: 4,
  backgroundColor: 'background',
  opacity: 0.90,
  m: 1,
  p: 1
}

export const label = {
  m: 1
}

export const select = {
  variant: 'text.monospace',
  borderColor: 'gray',
  '&:focus': {
    borderColor: 'primary',
    boxShadow: t => `0 0 0 2px ${t.colors.primary}`,
    outline: 'none'
  }
}

export const input = {
  variant: 'text.monospace',
  borderColor: 'gray',
  m: 0,
  '&:focus': {
    borderColor: 'primary',
    boxShadow: t => `0 0 0 2px ${t.colors.highlight}`,
    outline: 'none'
  }
}
