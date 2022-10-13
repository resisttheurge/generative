export const mobile = {
  display: 'grid',
  gridGap: 0,
  gridTemplateRows: 'min-content 1fr',
  gridTemplateColumns: 'min-content 1fr min-content',
  gridTemplateAreas: '"leftMenu title rightMenu" "content content content"',
  overflow: 'clip',
  width: '100vw',
  height: '100vh',

  headerBar: {
    gridColumnStart: 1,
    gridColumnEnd: -1,
    gridRowStart: 1,
    gridRowEnd: 1,
    bg: 'background',
    boxShadow: 'card',
    zIndex: 'header'
  },

  leftMenu: {
    variant: 'buttons.icon',
    gridArea: 'leftMenu',
    m: 2,
    justifySelf: 'center',
    alignSelf: 'center',
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
    variant: 'buttons.icon',
    gridArea: 'rightMenu',
    m: 2,
    justifySelf: 'center',
    alignSelf: 'center',
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
