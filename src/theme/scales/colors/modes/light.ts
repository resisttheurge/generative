import chroma from 'chroma-js'
import { get } from 'chromotome'

const palette = get('hermes')

/** Body foreground color */
export const text = chroma('#000').alpha(0.75).hex()

export const textInverse = chroma('#FFF').alpha(0.75).hex()

/** Body background color */
export const background = palette.background !== undefined ? palette.background : '#AAA'

/** Dark background for hover */
export const darkBackground = chroma(background).darken().hex()

/** Bright background for fields */
export const brightBackground = chroma(background).brighten().hex()

/** Primary brand color for links, buttons, etc. */
export const primary = palette.colors[0]

/** A secondary brand color for alternative styling */
export const secondary = palette.colors[1]

/** A contrast color for emphasizing UI */
export const accent = palette.colors[2]

/** A background color for highlighting text */
export const highlight = brightBackground

/** A faint color for backgrounds, borders, and accents that do not require high contrast with the background color */
export const muted = chroma(palette.colors[1]).brighten(3).desaturate(0.5).hex()

/** Used by @theme-ui/prism for code syntax highlighting */
export const gray = chroma(palette.colors[0]).brighten(2).desaturate(0.5).hex()

export const darkShadow = chroma.rgb(0, 0, 0, 0.125).hex()

export const shadow = chroma.rgb(127, 127, 127, 0.25).hex()

export const lightShadow = chroma.rgb(255, 255, 255, 0.125).hex()
