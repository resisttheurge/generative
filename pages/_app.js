import App from 'next/app'
import React from 'react'
import { Link, ThemeProvider } from 'theme-ui'
import Prism from '@theme-ui/prism'

import * as theme from '../lib/theme'

import GlobalStyle from '../components/GlobalStyle'

export default class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
    const components = {
      a: Link,
      pre: ({ children }) => <code>{children}</code>,
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
