import propTypes from 'prop-types'
import { useMemo } from 'react'
import invariant from 'tiny-invariant'
import dynamic from 'next/dynamic'
import { keyframes } from '@emotion/react'

import Loading from './svg/noun-loading.svg'

const load = keyframes({ to: { transform: 'rotate(1turn)' } })

const Fallback = () => <Loading sx={{ variant: 'images.icon', animation: `${load} 0.5s steps(7) infinite` }} />

const ArrowDown = dynamic(() => import('./svg/noun-arrow-down.svg'), { ssr: false, loading: Fallback })
const ArrowUp = dynamic(() => import('./svg/noun-arrow-up.svg'), { ssr: false, loading: Fallback })
const BookmarkFilled = dynamic(() => import('./svg/noun-bookmark-filled.svg'), { ssr: false, loading: Fallback })
const Bookmark = dynamic(() => import('./svg/noun-bookmark.svg'), { ssr: false, loading: Fallback })
const Check = dynamic(() => import('./svg/noun-check.svg'), { ssr: false, loading: Fallback })
const CheckboxChecked = dynamic(() => import('./svg/noun-checkbox-checked.svg'), { ssr: false, loading: Fallback })
const CheckboxIndeterminate = dynamic(() => import('./svg/noun-checkbox-indeterminate.svg'), { ssr: false, loading: Fallback })
const Checkbox = dynamic(() => import('./svg/noun-checkbox.svg'), { ssr: false, loading: Fallback })
const Close = dynamic(() => import('./svg/noun-close.svg'), { ssr: false, loading: Fallback })
const ColorMode = dynamic(() => import('./svg/noun-color-mode.svg'), { ssr: false, loading: Fallback })
const Dice = dynamic(() => import('./svg/noun-dice.svg'), { ssr: false, loading: Fallback })
const Download = dynamic(() => import('./svg/noun-download.svg'), { ssr: false, loading: Fallback })
const Edit = dynamic(() => import('./svg/noun-edit.svg'), { ssr: false, loading: Fallback })
const Expand = dynamic(() => import('./svg/noun-expand.svg'), { ssr: false, loading: Fallback })
const EyeClosed = dynamic(() => import('./svg/noun-eye-closed.svg'), { ssr: false, loading: Fallback })
const Eye = dynamic(() => import('./svg/noun-eye.svg'), { ssr: false, loading: Fallback })
const Gear = dynamic(() => import('./svg/noun-gear.svg'), { ssr: false, loading: Fallback })
const LockOpen = dynamic(() => import('./svg/noun-lock-open.svg'), { ssr: false, loading: Fallback })
const Lock = dynamic(() => import('./svg/noun-lock.svg'), { ssr: false, loading: Fallback })
const Menu = dynamic(() => import('./svg/noun-menu.svg'), { ssr: false, loading: Fallback })
const More = dynamic(() => import('./svg/noun-more.svg'), { ssr: false, loading: Fallback })
const RadioButtonOff = dynamic(() => import('./svg/noun-radio-button-off.svg'), { ssr: false, loading: Fallback })
const RadioButtonOn = dynamic(() => import('./svg/noun-radio-button-on.svg'), { ssr: false, loading: Fallback })
const Random = dynamic(() => import('./svg/noun-random.svg'), { ssr: false, loading: Fallback })
const Refresh = dynamic(() => import('./svg/noun-refresh.svg'), { ssr: false, loading: Fallback })
const Trash = dynamic(() => import('./svg/noun-trash.svg'), { ssr: false, loading: Fallback })

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
const expand = 'expand'
const eyeClosed = 'eye-closed'
const eye = 'eye'
const gear = 'gear'
const loading = 'loading'
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
  expand,
  eyeClosed,
  eye,
  gear,
  loading,
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

export const Icon = ({ noun, size = 0, ...props }) => {
  invariant(nouns.includes(noun), `Cannot create Icon with noun '${noun}' because is is not one of [${nouns.join(', ')}]`)
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
      case expand:
        return Expand
      case eyeClosed:
        return EyeClosed
      case eye:
        return Eye
      case gear:
        return Gear
      case loading:
        return Loading
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
      sx={{
        variant: 'images.icon'
      }}
      {...props}
    />
  )
}

Icon.nouns = nouns

Icon.propTypes = {
  noun: propTypes.oneOf(Icon.nouns).isRequired
}

export default Icon
