import { ThemeUIStyleObject } from 'theme-ui'

export const container: ThemeUIStyleObject = {
  position: 'fixed',
  bg: 'background',
  display: 'grid',
  gridGap: 0,
  gridTemplateRows: 'min-content 1fr',
  gridTemplateColumns: 'min-content 1fr min-content',
  gridTemplateAreas: '"leftMenu title rightMenu" "content content content"',
  overflow: 'clip',
  width: '100%',
  height: '100%'
}

export const headerBar: ThemeUIStyleObject = {
  gridColumnStart: 1,
  gridColumnEnd: -1,
  gridRowStart: 1,
  gridRowEnd: 1,
  bg: 'background',
  boxShadow: 'card',
  zIndex: 'header'
}

export const iconButton: ThemeUIStyleObject = {
  variant: 'buttons.icon',
  m: 2
}

export const leftMenu: ThemeUIStyleObject = {
  gridArea: 'leftMenu',
  zIndex: 'header'
}

export const heading: ThemeUIStyleObject = {
  variant: 'text.display',
  gridArea: 'title',
  justifySelf: 'center',
  alignSelf: 'center',
  zIndex: 'header'
}

export const rightMenu: ThemeUIStyleObject = {
  gridArea: 'rightMenu',
  zIndex: 'header'
}

export const content: ThemeUIStyleObject = {
  position: 'relative',
  gridArea: 'content',
  justifySelf: 'stretch',
  alignSelf: 'stretch',
  overflow: 'hidden',
  zIndex: 'content'
}

export const moreMenu: ThemeUIStyleObject = {
  gridArea: 'content',
  justifySelf: 'right',
  alignSelf: 'top',
  zIndex: 'header',

  flexDirection: 'column',
  '& > *': {
    boxShadow: 'card'
  }
}

export const sideNav: ThemeUIStyleObject = {
  position: 'relative', /* or choose `absolute` depending on desired behavior */
  gridArea: 'content',
  top: 0,
  bottom: 0,
  left: '-100vw',
  maxWidth: 'sidenav',
  zIndex: 'sidenav',
  bg: 'background',
  boxShadow: 'sidenav'
}
