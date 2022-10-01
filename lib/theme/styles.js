export const root = {
  variant: 'text.body',
  boxSizing: 'border-box',
  p: 0,
  m: 0,
  overflowX: 'hidden',
  overflowY: 'hidden'
}

export const blockquote = {
  borderLeftStyle: 'solid',
  borderLeftWidth: '4px',
  borderLeftColor: 'gray',
  marginInlineStart: [1, 2, 3],
  marginInlineEnd: [1, 2, 3]
}

export const h1 = {
  fontFamily: 'display',
  lineHeight: 'display',
  fontWeight: 'display',
  fontSize: [8, 10],
  marginBlockStart: 5,
  marginBlockEnd: 5,
  ml: [1, 2, 3],
  mr: [1, 2, 3]
}

export const h2 = {
  fontFamily: 'heading',
  lineHeight: 'heading',
  fontWeight: 'heading',
  fontSize: [6, 8],
  marginBlockStart: 4,
  marginBlockEnd: 4,
  ml: [1, 2, 3],
  mr: [1, 2, 3]
}

export const h3 = {
  fontFamily: 'heading',
  lineHeight: 'heading',
  fontWeight: 'heading',
  fontSize: [5, 7],
  marginBlockStart: 3,
  marginBlockEnd: 3,
  ml: [1, 2, 3],
  mr: [1, 2, 3]
}

export const h4 = {
  fontFamily: 'heading',
  lineHeight: 'heading',
  fontWeight: 'heading',
  fontSize: [4, 6],
  marginBlockStart: 2,
  marginBlockEnd: 2,
  ml: [1, 2, 3],
  mr: [1, 2, 3]
}

export const h5 = {
  fontFamily: 'heading',
  lineHeight: 'heading',
  fontWeight: 'heading',
  fontSize: [3, 5],
  marginBlockStart: 1,
  marginBlockEnd: 1,
  ml: [1, 2, 3],
  mr: [1, 2, 3]
}

export const h6 = {
  fontFamily: 'heading',
  lineHeight: 'heading',
  fontWeight: 'heading',
  fontSize: [2, 4],
  marginBlockStart: 0,
  marginBlockEnd: 0,
  ml: [1, 2, 3],
  mr: [1, 2, 3]
}

export const hr = {
  borderColor: 'muted',
  m: [2, 3, 4]
}

export const code = {
  bg: 'muted',
  fontFamily: 'monospace',
  fontSize: 'inherit',
  '.highlight': {
    bg: 'highlight'
  },
  '.comment,.prolog,.doctype,.cdata,.punctuation,.operator,.entity,.url': {
    color: 'gray'
  },
  '.comment': {
    fontStyle: 'italic'
  },
  '.property, .tag, .boolean, .number, .constant, .symbol, .deleted, .function, .class-name, .regex, .important, .variable': {
    color: 'accent'
  },
  '.atrule, .attr-value, .keyword': {
    color: 'primary'
  },
  '.selector, .attr-name, .string, .char, .builtin, .inserted': {
    color: 'secondary'
  }
}

export const p = {
  pre: {
    m: 0
  },
  'pre.prism-code': {
    display: 'inline',
    'div.token-line': {
      display: 'inline'
    }
  },
  ml: [1, 2, 3],
  mr: [1, 2, 3]
}

export const pre = {
  borderRadius: '4px',
  fontFamily: 'monospace',
  overflowX: 'auto',
  fontSize: 2,
  code: {
    ...code,
    color: 'inherit',
    fontSize: 'inherit'
  },
  p: 1,
  ml: [0, 2, 4],
  mr: [0, 2, 4]
}

export const table = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0
}

export const th = {
  textAlign: 'left',
  borderBottomStyle: 'solid'
}

export const td = {
  textAlign: 'left',
  borderBottomStyle: 'solid'
}

export const styles = {
  root,
  blockquote,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  hr,
  p,
  pre,
  code,
  table,
  th,
  td
}
