export const body = {
  fontSize: [0, 1, 2],
  fontFamily: 'body',
  fontWeight: 'body',
  fontLineHeight: 'body',
  m: 2
}

export const bold = {
  ...body,
  fontWeight: 'bold'
}

export const italic = {
  ...body,
  fontStyle: 'italic'
}

export const boldItalic = {
  ...bold,
  ...italic
}

export const display = {
  fontSize: 10,
  fontFamily: 'display',
  fontWeight: 'display',
  fontLineHeight: 'display',
  m: 2
}

export const heading = {
  fontSize: 8,
  fontFamily: 'heading',
  fontWeight: 'heading',
  fontLineHeight: 'heading',
  m: 2
}

export const monospace = {
  fontSize: [0, 1, 2],
  fontFamily: 'monospace',
  fontWeight: 'monospace',
  fontLineHeight: 'monospace',
  p: 1
}

export default body
