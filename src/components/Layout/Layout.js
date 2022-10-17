import Head from 'next/head'
import { Box, Flex, Heading, useColorMode, useThemeUI } from 'theme-ui'
import { useCallback, useState } from 'react'

import { IconButton } from '../IconButton'
import SideNav from '../SideNav'
import links from './links'
import { useFullscreen } from '../../effects'
import fscreen from 'fscreen'

export const Layout = ({ meta, ...props }) => {
  const { theme } = useThemeUI()

  const [navOpen, setNavOpen] = useState(false)
  const toggleNav = useCallback(() => setNavOpen(!navOpen), [navOpen, setNavOpen])
  const closeNav = useCallback(() => setNavOpen(false), [setNavOpen])

  const [colorMode, setColorMode] = useColorMode()
  const toggleColorMode = useCallback(() => setColorMode(colorMode === 'default' ? 'dark' : 'default'), [colorMode, setColorMode])

  const { active, enter, exit, node } = useFullscreen()
  const toggleFullscreen = useCallback(() => active ? exit() : enter(), [active, enter, exit])

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name='theme-color' content={theme.colors.background} />
      </Head>
      <Box ref={node} variant='layout.mobile' {...props}>
        <Box variant='layout.mobile.headerBar' />
        <Flex variant='layout.mobile.leftMenu'>
          <IconButton variant='layout.mobile.iconButton' icon={navOpen ? 'close' : 'menu'} onClick={toggleNav} />
        </Flex>
        <Heading variant='layout.mobile.heading'>
          {meta.title}
        </Heading>
        <Flex variant='layout.mobile.rightMenu'>
          {
            fscreen.fullscreenEnabled
              ? <IconButton variant='layout.mobile.iconButton' icon='expand' onClick={toggleFullscreen} />
              : undefined
          }
          <IconButton variant='layout.mobile.iconButton' icon='color-mode' onClick={toggleColorMode} />
        </Flex>
        <Box as='main' variant='layout.mobile.content' onClick={closeNav}>
          {props.children}
        </Box>
        <SideNav variant='layout.mobile.sideNav' open={navOpen} links={links} />
      </Box>
    </>
  )
}

export default Layout
