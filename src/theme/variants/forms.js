export const form = {
  variant: 'text.body',
  backgroundColor: 'background'
}

export const menu = {
  variant: 'forms.form',

  position: 'absolute',
  bottom: 0,
  left: '50%',
  transform: 'translate(-50%, 0)',
  width: 'max-content',
  flexDirection: 'column',
  justifyContent: 'stretch',
  boxShadow: 'card',

  field: {
    flexDirection: 'column',
    justifyContent: 'stretch'
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
}

export const label = {
  mx: 2
}

export const select = {
  variant: 'text.monospace',
  mx: 2,
  width: 'inherit',
  borderColor: 'gray',
  '&:focus': {
    borderColor: 'primary',
    boxShadow: t => `0 0 0 2px ${t.colors.primary}`,
    outline: 'none'
  }
}

export const input = {
  variant: 'text.monospace',
  mx: 2,
  width: 'inherit',
  borderColor: 'gray',
  '&:focus': {
    borderColor: 'primary',
    boxShadow: t => `0 0 0 2px ${t.colors.highlight}`,
    outline: 'none'
  }
}

export const slider = {
  mx: 2,
  width: 'inherit'
}
