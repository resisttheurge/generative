import App from 'next/app'
import React from 'react'
import { NavLink, ThemeUIProvider } from 'theme-ui'
import Prism from '@theme-ui/prism'
import { MDXProvider, useMDXComponents } from '@mdx-js/react'
import { useThemedStylesWithMdx } from '@theme-ui/mdx'

import theme from '../theme'

import GlobalStyle from '../components/GlobalStyle'
import { JSX } from 'theme-ui/jsx-runtime'
import Link from 'next/link'

const Anchor: React.FC<JSX.IntrinsicElements['a']> = ({
  href = '#',
  target,
  children,
}) => {
  return (
    <Link href={href} target={target} passHref legacyBehavior>
      <NavLink>{children}</NavLink>
    </Link>
  )
}

interface AppProviderProps {
  theme: Parameters<typeof ThemeUIProvider>[0]['theme']
  components: Parameters<typeof MDXProvider>[0]['components']
  children: React.ReactNode
}

const AppProvider: React.FC<AppProviderProps> = ({
  theme,
  components,
  children,
}) => {
  const componentsWithStyles = useThemedStylesWithMdx(
    useMDXComponents(components),
  )
  return (
    <ThemeUIProvider theme={theme}>
      <MDXProvider components={componentsWithStyles}>{children}</MDXProvider>
    </ThemeUIProvider>
  )
}

export class MyApp extends App {
  render(): JSX.Element {
    const { Component, pageProps } = this.props
    const components = {
      a: Anchor,
      code: Prism,
    }
    return (
      <AppProvider
        theme={theme}
        components={components as AppProviderProps['components']}
      >
        <GlobalStyle />
        <Component {...pageProps} />
      </AppProvider>
    )
  }
}

export default MyApp
