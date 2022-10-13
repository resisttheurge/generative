import Head from 'next/head'
import { Box, Heading, useColorMode, useThemeUI } from 'theme-ui'
import { useCallback, useState } from 'react'

import { IconButton } from '../IconButton'
import SideNav from '../SideNav'
import links from './links'

export const Layout = ({ meta, ...props }) => {
  const { theme } = useThemeUI()

  const [navOpen, setNavOpen] = useState(false)
  const toggleNav = useCallback(() => setNavOpen(!navOpen), [navOpen, setNavOpen])
  const closeNav = useCallback(() => setNavOpen(false), [setNavOpen])

  const [colorMode, setColorMode] = useColorMode()
  const toggleColorMode = useCallback(() => setColorMode(colorMode === 'default' ? 'dark' : 'default'), [colorMode, setColorMode])

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name='theme-color' content={theme.colors.background} />
      </Head>
      <Box variant='layout.mobile' {...props}>
        <Box variant='layout.mobile.headerBar' />
        <IconButton variant='layout.mobile.leftMenu' icon={navOpen ? 'close' : 'menu'} onClick={toggleNav} />
        <Heading variant='layout.mobile.heading'>
          {meta.title}
        </Heading>
        <IconButton variant='layout.mobile.rightMenu' icon='color-mode' onClick={toggleColorMode} />
        <Box as='main' variant='layout.mobile.content' onClick={closeNav}>
          {props.children}
        </Box>
        <SideNav variant='layout.mobile.sideNav' open={navOpen} links={links} />
      </Box>
    </>
  )
}

export default Layout
