import styled from 'styled-components'
import { compose, color, typography, space, position } from 'styled-system'

const Icon = styled('i')(
  props => ({
    verticalAlign: 'bottom',
    fontFamily: props.theme.fonts.icon,
    fontStyle: 'normal'
  }),
  compose(color, typography, space, position)
)

export default Icon
