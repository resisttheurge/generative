import { normalizeRepeatedSlashes } from 'next/dist/shared/lib/utils'

export const mobile = {
  position: 'fixed',
  bg: 'background',
  display: 'grid',
  gridGap: 0,
  gridTemplateRows: 'min-content 1fr',
  gridTemplateColumns: 'min-content 1fr min-content',
  gridTemplateAreas: '"leftMenu title rightMenu" "content content content"',
  overflow: 'clip',
  width: '100%',
  height: '100%',

  headerBar: {
    gridColumnStart: 1,
    gridColumnEnd: -1,
    gridRowStart: 1,
    gridRowEnd: 1,
    bg: 'background',
    boxShadow: 'card',
    zIndex: 'header'
  },

  iconButton: {
    variant: 'buttons.icon',
    m: 2
  },

  leftMenu: {
    gridArea: 'leftMenu',
    zIndex: 'header'
  },

  heading: {
    variant: 'text.display',
    gridArea: 'title',
    justifySelf: 'center',
    alignSelf: 'center',
    zIndex: 'header'
  },

  rightMenu: {
    gridArea: 'rightMenu',
    zIndex: 'header'
  },

  content: {
    position: 'relative',
    gridArea: 'content',
    justifySelf: 'stretch',
    alignSelf: 'stretch',
    overflow: 'hidden',
    zIndex: 'content'
  },

  moreMenu: {
    gridArea: 'content',
    justifySelf: 'right',
    alignSelf: 'top',
    zIndex: 'header',

    flexDirection: 'column',
    '& > *': {
      boxShadow: 'card'
    }
  },

  sideNav: {
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
}
