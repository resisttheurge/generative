import Head from 'next/head'
import { Box, Heading, useColorMode } from 'theme-ui'
import { useState } from 'react'

import { IconButton } from '../IconButton'
import SideNav from '../SideNav'
import links from './links'

export const Layout = ({ meta, ...props }) => {
  const [navOpen, setNavOpen] = useState(false)
  const [colorMode, setColorMode] = useColorMode()
  return (
    <>
      <Head>
        <title>{meta.title}</title>
      </Head>
      <Box
        {...props}
        sx={{
          display: 'grid',
          gridGap: 0,
          gridTemplateRows: 'min-content 1fr',
          gridTemplateColumns: 'min-content 1fr min-content',
          gridTemplateAreas: `
          "leftMenu title rightMenu"
          "content content content"
        `,
          overflow: 'clip',
          width: '100vw',
          height: '100vh'
        }}
      >
        <IconButton
          icon={navOpen ? 'close' : 'menu'}
          onClick={() => setNavOpen(!navOpen)}
          sx={{
            gridArea: 'leftMenu'
          }}
        />
        <Heading
          variant='display'
          sx={{
            gridArea: 'title',
            justifySelf: 'center',
            alignSelf: 'center'
          }}
        >
          {meta.title}
        </Heading>
        <IconButton
          icon='color-mode'
          onClick={() => setColorMode(colorMode === 'default' ? 'dark' : 'default')}
          sx={{
            gridArea: 'rightMenu'
          }}
        />
        <Box
          as='main'
          onClick={() => setNavOpen(false)}
          sx={{
            position: 'relative',
            gridArea: 'content',
            justifySelf: 'stretch',
            alignSelf: 'stretch',
            bg: 'background',
            overflowY: 'auto'
          }}
        >
          {props.children}
        </Box>
        <SideNav
          open={navOpen}
          links={links}
          sx={{ gridArea: 'content' }}
        />
      </Box>
    </>
  )
}

export default Layout
