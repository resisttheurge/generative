import { IconButton as OgIconButton } from 'theme-ui'

import BookmarkFilled from './svg/noun-bookmark-filled.svg'
import Bookmark from './svg/noun-bookmark.svg'
import Check from './svg/noun-check.svg'
import Checkbox from './svg/noun-checkbox.svg'
import Checked from './svg/noun-checked.svg'
import Close from './svg/noun-close.svg'
import ColorMode from './svg/noun-color-mode.svg'
import Delete from './svg/noun-delete.svg'
import Edit from './svg/noun-edit.svg'
import EyeClosed from './svg/noun-eye-closed.svg'
import Eye from './svg/noun-eye.svg'
import Gear from './svg/noun-gear.svg'
import Indeterminate from './svg/noun-indeterminate.svg'
import Menu from './svg/noun-menu.svg'
import More from './svg/noun-more.svg'
import RadioButtonOff from './svg/noun-radio-button-off.svg'
import RadioButtonOn from './svg/noun-radio-button-on.svg'

export const IconButton = ({ icon, ...props }) => {
  let Icon
  switch (icon) {
    case 'bookmark-filled':
      Icon = BookmarkFilled
      break
    case 'bookmark':
      Icon = Bookmark
      break
    case 'check':
      Icon = Check
      break
    case 'checkbox':
      Icon = Checkbox
      break
    case 'checked':
      Icon = Checked
      break
    case 'close':
      Icon = Close
      break
    case 'color-mode':
      Icon = ColorMode
      break
    case 'delete':
      Icon = Delete
      break
    case 'edit':
      Icon = Edit
      break
    case 'eye-closed':
      Icon = EyeClosed
      break
    case 'eye':
      Icon = Eye
      break
    case 'gear':
      Icon = Gear
      break
    case 'indeterminate':
      Icon = Indeterminate
      break
    case 'menu':
      Icon = Menu
      break
    case 'more':
      Icon = More
      break
    case 'radio-button-off':
      Icon = RadioButtonOff
      break
    case 'radio-button-on':
      Icon = RadioButtonOn
      break
  }

  return (
    <OgIconButton
      {...props}
      sx={{
        p: 1,
        m: 2,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Icon
        sx={{
          fill: 'text',
          width: '24px',
          height: '24px'
        }}
      />
    </OgIconButton>
  )
}
