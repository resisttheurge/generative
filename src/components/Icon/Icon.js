import propTypes from 'prop-types'
import { useMemo } from 'react'
import invariant from 'tiny-invariant'

import ArrowDown from './svg/noun-arrow-down.svg'
import ArrowUp from './svg/noun-arrow-up.svg'
import BookmarkFilled from './svg/noun-bookmark-filled.svg'
import Bookmark from './svg/noun-bookmark.svg'
import Check from './svg/noun-check.svg'
import CheckboxChecked from './svg/noun-checkbox-checked.svg'
import CheckboxIndeterminate from './svg/noun-checkbox-indeterminate.svg'
import Checkbox from './svg/noun-checkbox.svg'
import Close from './svg/noun-close.svg'
import ColorMode from './svg/noun-color-mode.svg'
import Dice from './svg/noun-dice.svg'
import Download from './svg/noun-download.svg'
import Edit from './svg/noun-edit.svg'
import EyeClosed from './svg/noun-eye-closed.svg'
import Eye from './svg/noun-eye.svg'
import Gear from './svg/noun-gear.svg'
import LockOpen from './svg/noun-lock-open.svg'
import Lock from './svg/noun-lock.svg'
import Menu from './svg/noun-menu.svg'
import More from './svg/noun-more.svg'
import RadioButtonOff from './svg/noun-radio-button-off.svg'
import RadioButtonOn from './svg/noun-radio-button-on.svg'
import Random from './svg/noun-random.svg'
import Refresh from './svg/noun-refresh.svg'
import Trash from './svg/noun-trash.svg'

const arrowDown = 'arrow-down'
const arrowUp = 'arrow-up'
const bookmarkFilled = 'bookmark-filled'
const bookmark = 'bookmark'
const check = 'check'
const checkboxChecked = 'checkbox-checked'
const checkboxIndeterminate = 'checkbox-indeterminate'
const checkbox = 'checkbox'
const close = 'close'
const colorMode = 'color-mode'
const dice = 'dice'
const download = 'download'
const edit = 'edit'
const eyeClosed = 'eye-closed'
const eye = 'eye'
const gear = 'gear'
const lockOpen = 'lock-open'
const lock = 'lock'
const menu = 'menu'
const more = 'more'
const radioButtonOff = 'radio-button-off'
const radioButtonOn = 'radio-button-on'
const random = 'random'
const refresh = 'refresh'
const trash = 'trash'

export const nouns = [
  arrowDown,
  arrowUp,
  bookmarkFilled,
  bookmark,
  check,
  checkboxChecked,
  checkboxIndeterminate,
  checkbox,
  close,
  colorMode,
  dice,
  download,
  edit,
  eyeClosed,
  eye,
  gear,
  lockOpen,
  lock,
  menu,
  more,
  radioButtonOff,
  radioButtonOn,
  random,
  refresh,
  trash
]

export const Icon = ({ noun, ...props }) => {
  invariant(nouns.includes(noun), `Cannot create Icon with noun '${noun}' because is is not one of [${nouns.join()}]`)
  const Svg = useMemo(() => {
    switch (noun) {
      case arrowDown:
        return ArrowDown
      case arrowUp:
        return ArrowUp
      case bookmarkFilled:
        return BookmarkFilled
      case bookmark:
        return Bookmark
      case check:
        return Check
      case checkboxChecked:
        return CheckboxChecked
      case checkboxIndeterminate:
        return CheckboxIndeterminate
      case checkbox:
        return Checkbox
      case close:
        return Close
      case colorMode:
        return ColorMode
      case dice:
        return Dice
      case download:
        return Download
      case edit:
        return Edit
      case eyeClosed:
        return EyeClosed
      case eye:
        return Eye
      case gear:
        return Gear
      case lockOpen:
        return LockOpen
      case lock:
        return Lock
      case menu:
        return Menu
      case more:
        return More
      case radioButtonOff:
        return RadioButtonOff
      case radioButtonOn:
        return RadioButtonOn
      case random:
        return Random
      case refresh:
        return Refresh
      case trash:
        return Trash
    }
  }, [noun])

  return (
    <Svg
      {...props}
      sx={{
        fill: 'text',
        width: '24px',
        height: '24px'
      }}
      width='24px'
      height='24px'
    />
  )
}

Icon.nouns = nouns

Icon.propTypes = {
  noun: propTypes.oneOf(Icon.nouns).isRequired
}

export default Icon
