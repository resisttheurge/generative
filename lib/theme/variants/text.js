export const body = {
  fontSize: [0],
  fontFamily: 'body',
  fontWeight: 'body',
  fontLineHeight: 'body'
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
  fontSize: [4],
  fontFamily: 'display',
  fontWeight: 'display',
  fontLineHeight: 'display',
  m: 2
}

export const heading = {
  fontSize: [2],
  fontFamily: 'heading',
  fontWeight: 'heading',
  fontLineHeight: 'heading',
  m: 2
}

export const monospace = {
  fontSize: [0],
  fontFamily: 'monospace',
  fontWeight: 'monospace',
  fontLineHeight: 'monospace',
  p: 1
}

export default body
