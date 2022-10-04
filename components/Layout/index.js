import Head from 'next/head'
import Link from 'next/link'
import { Box, Heading, NavLink, Text, Themed, useColorMode } from 'theme-ui'
import { useState } from 'react'

import links from './links'
import { IconButton } from '../IconButton'

const NavLinks = ({ title, links, ...props }) => (
  <>
    {title ? <Text variant='bold'>{title}</Text> : undefined}
    <Themed.ul>
      {Object.entries(links)
        .map(
          ([key, value]) => (
            <Themed.li key={typeof value === 'string' ? value : key}>
              {
                typeof value === 'string'
                  ? <Link href={value} passHref><NavLink>{key}</NavLink></Link>
                  : <NavLinks title={key} links={value} />
              }
            </Themed.li>
          )
        )}
    </Themed.ul>
  </>
)

const SideNav = ({ open, links, ...props }) => {
  return (
    <Box
      {...props}
      sx={{
        position: 'relative', /* or choose `absolute` depending on desired behavior */
        top: 0,
        bottom: 0,
        maxWidth: '300px',
        left: '-100vw',
        transition: 'transform .3s ease-in-out',
        transform: open ? 'translateX(100vw)' : 'none',
        bg: 'background'
      }}
    >
      <NavLinks links={links} />
    </Box>
  )
}

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
        <main
          onClick={() => setNavOpen(false)}
          sx={{
            gridArea: 'content',
            justifySelf: 'stretch',
            bg: 'background',
            overflowY: 'scroll'
          }}
        >
          {props.children}
        </main>
        <SideNav
          open={navOpen}
          links={links}
          sx={{ gridArea: 'content' }}
        />
      </Box>
    </>
  )
}
