import { Box } from 'theme-ui'

import NavLinks from './NavLinks'

export const SideNav = ({ open, links, ...props }) => {
  return (
    <Box
      variant='layout.sidenav'
      sx={{
        transition: 'transform .3s ease-in-out',
        transform: open ? 'translateX(100vw)' : 'none'
      }}
      {...props}
    >
      <NavLinks links={links} />
    </Box>
  )
}

export default SideNav
