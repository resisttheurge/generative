import { get, ThemeUIStyleObject } from 'theme-ui'

export const form: ThemeUIStyleObject = {
  variant: 'text.body',
  backgroundColor: 'background'
}

export const menu: ThemeUIStyleObject = {
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

export const label: ThemeUIStyleObject = {
  mx: 2,
  width: 'max-content'
}

export const select: ThemeUIStyleObject = {
  variant: 'text.monospace',
  m: 2,
  width: 'fill-available',
  borderColor: 'gray',
  '&:focus': {
    borderColor: 'primary',
    boxShadow: t => {
      const color = get(t, 'colors.primary')
      if (typeof color === 'string') {
        return `0 0 0 2px ${color}`
      }
    },
    outline: 'none'
  }
}

export const input: ThemeUIStyleObject = {
  variant: 'text.monospace',
  m: 2,
  width: 'fill-available',
  borderColor: 'gray',
  '&:focus': {
    borderColor: 'primary',
    boxShadow: t => {
      const color = get(t, 'colors.highlight')
      if (typeof color === 'string') {
        return `0 0 0 2px ${color}`
      }
    },
    outline: 'none'
  }
}

export const slider: ThemeUIStyleObject = {
  mx: 2,
  width: 'fill-available'
}
