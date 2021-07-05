import * as R from 'ramda'
import { get, getNames } from 'chromotome'

export const fonts = ['Roboto', '"Material Icons"']
fonts.normal = fonts[0]
fonts.icon = fonts[1]

export const space = [0, '.25rem', '.5rem', '1rem', '2rem', '4rem']
space.s = space[1]
space.m = space[2]
space.l = space[3]
space.xl = space[4]
space.xxl = space[5]

export const fontSizes = [
  '.75rem',
  '.875rem',
  '1rem',
  '1.25rem',
  '1.5rem',
  '2rem'
]
fontSizes.s = fontSizes[0]
fontSizes.m = fontSizes[1]
fontSizes.l = fontSizes[2]
fontSizes.xl = fontSizes[3]
fontSizes.xxl = fontSizes[4]
fontSizes.xxxl = fontSizes[5]

export const lineHeights = [1.25, 1.5, 1.75]

export const breakpoints = ['40em', '52em', '64em']
breakpoints.s = breakpoints[0]
breakpoints.m = breakpoints[1]
breakpoints.l = breakpoints[2]

export const colors = {
  palettes: R.fromPairs(getNames().map(name => [name, get(name)]))
}

export const zIndices = [0, 10, 100, 1000]
zIndices.appBackground = zIndices[0]
zIndices.contentBackground = zIndices[1]
zIndices.contentForeground = zIndices[2]
zIndices.appForeground = zIndices[3]

export const theme = {
  fonts,
  space,
  fontSizes,
  lineHeights,
  breakpoints,
  colors,
  zIndices
}

export default theme
