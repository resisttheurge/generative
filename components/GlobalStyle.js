import { createGlobalStyle } from 'styled-components'

import 'normalize.css'
import 'material-icons/iconfont/material-icons.css'

const GlobalStyle = createGlobalStyle`
html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}
`

export default GlobalStyle
