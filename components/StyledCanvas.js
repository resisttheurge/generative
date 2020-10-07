import styled from 'styled-components'
import { compose, space, zIndex, layout } from 'styled-system'

const StyledCanvas = styled('canvas')(
  { boxSizing: 'border-box', flex: 1 },
  compose(space, zIndex, layout)
)

export const StyledDiv = styled('div')(
  { boxSizing: 'border-box', flex: 1 },
  compose(space, zIndex, layout)
)

export default StyledCanvas
