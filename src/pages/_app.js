import App from 'next/app'
import React from 'react'
import { Link, ThemeProvider } from 'theme-ui'
import Prism from '@theme-ui/prism'
import {
  MDXProvider,
  useMDXComponents
} from '@mdx-js/react'
import { useThemedStylesWithMdx } from '@theme-ui/mdx'

import * as theme from '../theme'

import GlobalStyle from '../components/GlobalStyle'

const Pre = (props) => <code {...props} />

const AppProvider = ({ theme, components, children }) => {
  const componentsWithStyles = useThemedStylesWithMdx(useMDXComponents(components))
  return (
    <ThemeProvider theme={theme}>
      <MDXProvider components={componentsWithStyles}>
        {children}
      </MDXProvider>
    </ThemeProvider>
  )
}

export class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
    const components = {
      a: Link,
      pre: Pre,
      code: Prism
    }
    return (
      <AppProvider theme={theme} components={components}>
        <GlobalStyle />
        <Component {...pageProps} />
      </AppProvider>
    )
  }
}

export default MyApp
