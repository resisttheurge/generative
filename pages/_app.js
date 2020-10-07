import App from 'next/app'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import 'normalize.css'
import 'material-icons/iconfont/material-icons.css'

import theme from '../lib/theme'

import GlobalStyle from '../components/GlobalStyle'
import { Helmet } from 'react-helmet'

export default class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
    return (
      <>
        <Helmet>
          <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Roboto&display=swap' />
        </Helmet>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Component {...pageProps} />
        </ThemeProvider>
      </>
    )
  }
}
