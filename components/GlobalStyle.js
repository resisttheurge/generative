import { Global } from '@emotion/react'

const GlobalStyle = (props) => (
  <Global
    styles={(theme) => ({
      html: {
        boxSizing: 'border-box'
      },
      '*, *:before, *:after': {
        boxSizing: 'inherit'
      }
    })}
  />
)

export default GlobalStyle
