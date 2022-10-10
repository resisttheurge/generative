import { useMemo } from 'react'
import propTypes from 'prop-types'

import BookmarkFilled from './svg/noun-bookmark-filled.svg'
import Bookmark from './svg/noun-bookmark.svg'
import Check from './svg/noun-check.svg'
import Checkbox from './svg/noun-checkbox.svg'
import Checked from './svg/noun-checked.svg'
import Close from './svg/noun-close.svg'
import ColorMode from './svg/noun-color-mode.svg'
import Edit from './svg/noun-edit.svg'
import EyeClosed from './svg/noun-eye-closed.svg'
import Eye from './svg/noun-eye.svg'
import Gear from './svg/noun-gear.svg'
import Indeterminate from './svg/noun-indeterminate.svg'
import Menu from './svg/noun-menu.svg'
import More from './svg/noun-more.svg'
import RadioButtonOff from './svg/noun-radio-button-off.svg'
import RadioButtonOn from './svg/noun-radio-button-on.svg'
import Trash from './svg/noun-trash.svg'

export const bookmarkFilled = 'bookmark-filled'
export const bookmark = 'bookmark'
export const check = 'check'
export const checkbox = 'checkbox'
export const checked = 'checked'
export const close = 'close'
export const colorMode = 'color-mode'
export const edit = 'edit'
export const eyeClosed = 'eye-closed'
export const eye = 'eye'
export const gear = 'gear'
export const indeterminate = 'indeterminate'
export const menu = 'menu'
export const more = 'more'
export const radioButtonOff = 'radio-button-off'
export const radioButtonOn = 'radio-button-on'
export const trash = 'trash'

export const availableNouns = [
  bookmarkFilled,
  bookmark,
  check,
  checkbox,
  checked,
  close,
  colorMode,
  edit,
  eyeClosed,
  eye,
  gear,
  indeterminate,
  menu,
  more,
  radioButtonOff,
  radioButtonOn,
  trash
]

export const Icon = ({ noun, ...props }) => {
  const Svg = useMemo(() => {
    switch (noun) {
      case bookmarkFilled:
        return BookmarkFilled
      case bookmark:
        return Bookmark
      case check:
        return Check
      case checkbox:
        return Checkbox
      case checked:
        return Checked
      case close:
        return Close
      case colorMode:
        return ColorMode
      case edit:
        return Edit
      case eyeClosed:
        return EyeClosed
      case eye:
        return Eye
      case gear:
        return Gear
      case indeterminate:
        return Indeterminate
      case menu:
        return Menu
      case more:
        return More
      case radioButtonOff:
        return RadioButtonOff
      case radioButtonOn:
        return RadioButtonOn
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

Icon.propTypes = {
  noun: propTypes.oneOf(availableNouns)
}

export default Icon
