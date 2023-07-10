import { ThemeStyles } from 'theme-ui'
import * as a from './a'
import * as blockquote from './blockquote'
import * as code from './code'
import * as h from './h'
import * as hr from './hr'
import * as li from './li'
import * as p from './p'
import * as pre from './pre'
import * as root from './root'
import * as table from './table'
import * as ul from './ul'

export const styles: ThemeStyles = {
  ...a,
  ...blockquote,
  ...code,
  ...h,
  ...hr,
  ...li,
  ...p,
  ...pre,
  ...root,
  ...table,
  ...ul
}

export default styles
