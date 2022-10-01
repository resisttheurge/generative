import Links from './Links.mdx'
import Head from 'next/head'
import { Box, Heading, IconButton, MenuButton } from 'theme-ui'
import { Sidenav } from '@theme-ui/sidenav'

const Layout = ({ meta, ...props }) => (
  <>
    <Head>
      <title>{meta.title}</title>
    </Head>
    <Box
      {...props}
      sx={{
        display: 'grid',
        gridGap: 0,
        gridTemplateRows: ['auto', 'auto 1fr'],
        gridTemplateColumns: ['auto', '1fr auto', '1fr auto 1fr'],
        overflow: 'clip',
        width: '100vw',
        height: '100vh'
      }}
    >
      <MenuButton />
      <Heading variant='display'>{meta.title}</Heading>
      <IconButton />
      <Sidenav>
        <Links />
      </Sidenav>
      <main
        sx={{
          bg: 'background',
          overflowY: 'scroll'
        }}
      >
        {props.children}

      </main>
    </Box>
  </>
)

export default Layout
