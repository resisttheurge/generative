import { Box, BoxProps } from 'theme-ui'

import NavLinks, { LinkConfig } from './NavLinks'

export interface SideNavProps {
  open: boolean
  links: LinkConfig
}

export const SideNav = ({
  open,
  links,
  ...props
}: SideNavProps & BoxProps): JSX.Element => {
  return (
    <Box
      variant='layout.sidenav'
      sx={{
        transition: 'transform .3s ease-in-out',
        transform: open ? 'translateX(100vw)' : 'none',
      }}
      {...props}
    >
      <NavLinks links={links} />
    </Box>
  )
}

export default SideNav
