import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import {
  compose,
  space,
  shadow,
  typography,
  color,
  variant,
  position
} from 'styled-system'

const HeaderContainer = styled('div')(
  {
    display: 'flex',
    justifyContent: 'space-around'
  },
  compose(space, shadow, typography, color, position)
)

const StyledAnchor = styled('a')(
  {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
      userSelect: 'none'
    }
  },
  compose(
    space,
    typography,
    color,
    variant({
      variants: {
        active: {
          textDecoration: 'underline',
          fontWeight: 'bold',
          color: 'palettes.rag-bangalore.colors.0'
        }
      }
    })
  )
)

const navItems = [
  // ['/', 'Home'],
  // ['/about', 'About'],
  // ['/scratch', 'WIP'],
  // ['/glsl', 'Shaders'],
  // ['/p5', 'Processing'],
  ['/grids', 'Grids'],
  ['/poisson-disk-sampling', 'Poisson Disk Sampling'],
  ['/palettes', 'Palettes'],
  ['/dot-noise', 'Dot Noise'],
  ['/mossy-tangle', 'Mossy Tangle'],
  ['/rainbow-clouds', 'Rainbow Clouds'],
  ['/circle-movements', 'Circle Movements']
]

const makeLinks = pathname =>
  navItems.map(([href, title]) => (
    <Link key={href} href={href} passHref>
      <StyledAnchor
        fontFamily='normal'
        mr={['s', 'm', 'l']}
        variant={(href === pathname && 'active') || undefined}
      >
        {title}
      </StyledAnchor>
    </Link>
  ))

const Header = () => {
  const router = useRouter()
  const links = useMemo(() => makeLinks(router.pathname), [router.pathname])
  return (
    <HeaderContainer
      zIndex='appForeground'
      boxShadow='0 4px 8px 0 rgba(0,0,0,0.2)'
      padding={['s', 'm', 'l']}
      bg='palettes.bloomberg.background'
      color='palettes.rag-bangalore.colors.3'
      fontSize={['l', 'xl', 'xxl']}
      lineHeight={[0, 1, 1]}
    >
      {links}
    </HeaderContainer>
  )
}

export default Header
