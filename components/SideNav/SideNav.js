import { Box } from 'theme-ui'

import NavLinks from './NavLinks'

export const SideNav = ({ open, links, ...props }) => {
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

export default SideNav
