import { ThemeUIStyleObject } from 'theme-ui'

export const checkbox: ThemeUIStyleObject = {
  fontSize: 'inherit',
  color: 'gray',
  ml: [1],
  size: [5, 4],
  transition: 'activate',
  borderRadius: [3, 2],
  '*:focus-within > &, *:hover > &, &:hover': {
    bg: 'lightShadow',
    color: 'primary',
    boxShadow: 'button',
  },
}

export const form: ThemeUIStyleObject = {
  variant: 'text.body',
}

export const menuCollapsed: ThemeUIStyleObject = {
  variant: 'forms.menu',
  width: 'min-content',
  gap: 0,
}

export const menu: ThemeUIStyleObject = {
  variant: 'forms.form',
  position: 'absolute',
  bottom: 0,
  mb: [6, 5, 4],
  left: '50%',
  transform: 'translate(-50%, 0)',
  width: ['96vw', '66vw', '50vw', '33vw'],
  maxHeight: '100%',
  zIndex: 'menu',

  display: 'grid',
  gridTemplateColumns: 'min-content 1fr min-content 1fr min-content',
  gridTemplateRows: 'min-content',
  gridTemplateAreas: `
    "left . center . right"
    "left . center . right"
  `,
  gap: [4, 3, 2],
  placeItems: 'center',

  fieldset: {
    display: 'grid',
    gridTemplateColumns: 'subgrid',
    gridTemplateRows: '1fr',
    gridColumn: '1 / -1',
    rowGap: [2, 1, 1, 0],
    bg: 'darkBackground',
    borderTopLeftRadius: [4, 3],
    borderTopRightRadius: [4, 3],
    borderBottomLeftRadius: [3, 2],
    borderBottomRightRadius: [3, 2],
    boxShadow: 'card',
    overflow: 'clip',
  },

  field: {
    py: [4, 3, 2],
    px: [5, 4, 3, 2],
    minHeight: [5, 4, 3],
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'subgrid',
    gridTemplateAreas: '"gutter label control control control"',
    alignItems: 'center',
    justifyItems: 'stretch',
    bg: 'background',
    '&:focus-within': {
      bg: 'brightBackground',
    },

    control: {
      gridArea: 'control',
      px: [5, 4, 3],
    },
  },

  actions: {
    mx: [4, 3, 2],
    p: [4, 3, 2],
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'subgrid',
    placeItems: 'center',
    bg: 'background',
    borderTopLeftRadius: [3, 2],
    borderTopRightRadius: [3, 2],
    borderBottomLeftRadius: [4, 3],
    borderBottomRightRadius: [4, 3],
    boxShadow: 'card',
  },
}

export const label: ThemeUIStyleObject = {
  alignSelf: 'center',
  userSelect: 'none',
  fontSize: 'inherit',
  width: 'fit-content',
}

export const select: ThemeUIStyleObject = {
  variant: 'text.monospace',
  fontSize: 'inherit',
  width: 'fill-available',
  bg: 'inherit',
  borderColor: 'gray',
  borderRadius: [3, 2],
  pl: [4, 3, 2],
  my: [4, 3, 2],
  transition: 'activate',
  '& ~ svg': {
    size: [5, 4, 3],
    ml: [-6, -5],
  },
  ':focus, :hover': {
    bg: 'lightShadow',
    borderColor: 'primary',
    outline: 'none',
    boxShadow: 'button',
  },
}

export const input: ThemeUIStyleObject = {
  variant: 'text.monospace',
  fontSize: 'inherit',
  width: 'fill-available',
  borderColor: 'gray',
  borderRadius: [3, 2],
  pl: [4, 3, 2],
  my: [4, 3, 2],
  transition: 'activate',
  ':focus, :hover': {
    bg: 'lightShadow',
    borderColor: 'primary',
    outline: 'none',
    boxShadow: 'button',
  },
}

export const slider: ThemeUIStyleObject = {
  height: [2, 1],
  ml: [1],
  width: 'fill-available',
  transition: 'activate',
  bg: 'gray',
  ':focus, :hover': {
    bg: 'primary',
    boxShadow: 'button',
  },
  thumb: {
    size: [5, 4],
    bg: 'inherit',
    transition: 'activate',
    boxShadow: 'inherit',
  },
}
