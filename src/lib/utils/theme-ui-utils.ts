import { ColorOrNestedColorScale } from '@theme-ui/css'
import invariant from 'tiny-invariant'

export function extractColor (color: ColorOrNestedColorScale | undefined): string {
  invariant(typeof color === 'string', 'Color must be a string')
  return color
}

export function extractColorOrElse <NSV> (color: ColorOrNestedColorScale | undefined, fallback: NSV): string | NSV {
  return typeof color === 'string' ? color : fallback
}
