import Header from './Header'
import chroma from 'chroma-js'
import { compose, space, typography, color, position } from 'styled-system'
import styled from 'styled-components'

const LayoutContainer = styled('div')(
  {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    width: '100vw',
    height: '100vh',
    backgroundColor: props =>
      chroma(props.theme.colors.palettes.bloomberg.background)
        .darken()
        .hex()
  },
  compose(space, typography, color, position)
)

const ContentContainer = styled('div')({
  flex: 1,
  overflow: 'hidden'
})

const Layout = props => (
  <LayoutContainer zIndex='appBackground'>
    <Header />
    <ContentContainer>{props.children}</ContentContainer>
  </LayoutContainer>
)

export default Layout
