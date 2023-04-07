export const body = {
  fontSize: 1,
  fontFamily: 'body',
  fontWeight: 'body',
  lineHeight: 'body'
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
  fontSize: 4,
  fontFamily: 'display',
  fontWeight: 'display',
  lineHeight: 'display',
  my: 1
}

export const heading = {
  fontSize: 2,
  fontFamily: 'heading',
  fontWeight: 'heading',
  lineHeight: 'heading'
}

export const monospace = {
  fontSize: 1,
  fontFamily: 'monospace',
  fontWeight: 'monospace',
  lineHeight: 'monospace',
  p: 1
}

export default body
