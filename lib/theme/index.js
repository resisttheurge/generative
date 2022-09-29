import { mergeAll } from 'ramda'

import * as colors from './colors'
import * as typography from './typography'
import * as layout from './layout'
import * as styles from './styles'
import * as variants from './variants'

export const theme = mergeAll([colors, typography, layout, styles, variants])

export default theme
