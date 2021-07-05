import App from 'next/app'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import 'normalize.css'
import 'material-icons/iconfont/material-icons.css'

import theme from '../lib/theme'

import GlobalStyle from '../components/GlobalStyle'

export default class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
    return (
      <>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Component {...pageProps} />
        </ThemeProvider>
      </>
    )
  }
}
