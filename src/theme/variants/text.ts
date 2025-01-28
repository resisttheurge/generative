import { ThemeUIStyleObject } from 'theme-ui'

export const body: ThemeUIStyleObject = {
  fontSize: [4, 3, 2],
  fontFamily: 'body',
  fontWeight: 'body',
  lineHeight: 'body'
}

export const bold: ThemeUIStyleObject = {
  ...body,
  fontWeight: 'bold'
}

export const italic: ThemeUIStyleObject = {
  ...body,
  fontStyle: 'italic'
}

export const boldItalic: ThemeUIStyleObject = {
  ...bold,
  ...italic
}

export const display: ThemeUIStyleObject = {
  fontSize: 4,
  fontFamily: 'display',
  fontWeight: 'display',
  lineHeight: 'display',
  my: 1
}

export const heading: ThemeUIStyleObject = {
  fontSize: 2,
  fontFamily: 'heading',
  fontWeight: 'heading',
  lineHeight: 'heading'
}

export const monospace: ThemeUIStyleObject = {
  fontSize: 1,
  fontFamily: 'monospace',
  fontWeight: 'monospace',
  lineHeight: 'monospace',
  p: 1
}

export default body
