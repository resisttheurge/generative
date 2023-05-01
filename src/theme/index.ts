import { Theme } from 'theme-ui'

import * as scales from './scales'
import styles from './styles'
import * as variants from './variants'

const makeTheme = <T extends Theme>(t: T): T => t

export const theme = makeTheme({ ...scales, styles, ...variants })

export type ExactTheme = typeof theme

export default theme
