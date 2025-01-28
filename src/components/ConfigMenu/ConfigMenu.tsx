import { useState } from 'react'
import { Box } from 'theme-ui'
import IconButton from '../IconButton'

export const ConfigMenu = ({
  onClickRandom = () => {},
  onClickDownload = () => {},
  visibleOnInit = false,
  ...props
}): JSX.Element => {
  const [visible, setVisible] = useState(visibleOnInit)

  const toggleMenuButton = <IconButton icon='gear' fab={!visible} key='toggleMenu' onClick={() => setVisible(!visible)} sx={{ gridArea: 'center' }} />

  return (
    <Box
      as='form'
      variant={visible ? 'forms.menu' : 'forms.menuCollapsed'}
      {...props}
    >
      {
        !visible
          ? toggleMenuButton
          : (
            <>
              <Box variant='forms.menu.fieldset'>
                {props.children}
              </Box>
              <Box variant='forms.menu.actions'>
                <IconButton icon='dice' onClick={onClickRandom} sx={{ gridArea: 'left' }} />
                {toggleMenuButton}
                <IconButton icon='download' onClick={onClickDownload} sx={{ gridArea: 'right' }} />
              </Box>
            </>
            )
      }
    </Box>
  )
}

export default ConfigMenu
