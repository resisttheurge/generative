import Head from 'next/head'
import { Box, BoxProps, Flex, Heading, useColorMode } from 'theme-ui'
import { useCallback, useState } from 'react'

import { IconButton } from '../IconButton'
import SideNav from '../SideNav'
import links from './links'
import { useFullscreen } from '../../effects'
import { useTheme } from '../../effects/useTheme'

export interface MetaProps {
  title: string
}

export interface LayoutProps extends BoxProps {
  meta: MetaProps

}

export const Layout = ({ meta, ...props }: LayoutProps): JSX.Element => {
  const { theme } = useTheme()
  const [navOpen, setNavOpen] = useState(false)
  const toggleNav = useCallback(() => setNavOpen(!navOpen), [navOpen, setNavOpen])
  const closeNav = useCallback(() => setNavOpen(false), [setNavOpen])

  const [moreOpen, setMoreOpen] = useState(false)
  const toggleMore = useCallback(() => setMoreOpen(!moreOpen), [moreOpen, setMoreOpen])
  const closeMore = useCallback(() => setMoreOpen(false), [setMoreOpen])

  const closeMenus = useCallback(() => {
    closeNav()
    closeMore()
  }, [closeNav, closeMore])

  const [colorMode, setColorMode] = useColorMode()
  const toggleColorMode = useCallback(() => setColorMode(colorMode === 'default' ? 'dark' : 'default'), [colorMode, setColorMode])

  const { active, enter, exit, node } = useFullscreen()
  const toggleFullscreen = useCallback(
    () => {
      (active ? exit() : enter())
        .catch((reason: Error) => {
          console.error(`Promise rejected while ${active ? 'exiting' : 'entering'} fullscreen with reason: ${reason.message}`)
          console.error(reason)
        })
    },
    [active, enter, exit]
  )

  interface MoreMenuProps {
    open: boolean
  }

  const MoreMenu = ({ open }: MoreMenuProps): JSX.Element | null => (
    open
      ? (
        <Flex variant='layout.moreMenu'>
          <IconButton fab icon='color-mode' onClick={toggleColorMode} />
          <IconButton fab icon='expand' onClick={toggleFullscreen} />
        </Flex>
        )
      : null
  )
  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name='theme-color' content={theme.colors.background} />
      </Head>
      <Box ref={node} variant='layout.container' {...props}>
        <Box variant='layout.headerBar' />
        <Flex variant='layout.leftMenu'>
          <IconButton icon={navOpen ? 'close' : 'menu'} onClick={toggleNav} />
        </Flex>
        <Heading variant='layout.heading'>
          {meta.title}
        </Heading>
        <Flex variant='layout.rightMenu'>
          <IconButton icon='more' onClick={toggleMore} />
        </Flex>
        <Box as='main' variant='layout.content' onClick={closeMenus}>
          {props.children}
        </Box>
        <MoreMenu open={moreOpen} />
        <SideNav variant='layout.sideNav' open={navOpen} links={links} />
      </Box>
    </>
  )
}

export default Layout
