import { Global } from '@emotion/react'

const GlobalStyle = (): JSX.Element => (
  <Global
    styles={() => ({
      html: {
        boxSizing: 'border-box',
      },
      '*, *:before, *:after': {
        boxSizing: 'inherit',
      },
    })}
  />
)
export default GlobalStyle
