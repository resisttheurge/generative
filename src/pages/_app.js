import App from 'next/app'
import React from 'react'
import { Link, ThemeProvider } from 'theme-ui'
import Prism from '@theme-ui/prism'

import * as theme from '../theme'

import GlobalStyle from '../components/GlobalStyle'

const Pre = (props) => <code {...props} />

export class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
    const components = {
      a: Link,
      pre: Pre,
      code: Prism
    }
    return (
      <ThemeProvider theme={theme} components={components}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    )
  }
}

export default MyApp
