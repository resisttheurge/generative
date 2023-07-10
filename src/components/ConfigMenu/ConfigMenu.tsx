import { useState } from 'react'
import { Flex, Divider } from 'theme-ui'
import IconButton from '../IconButton'

export const ConfigMenu = ({
  onClickRandom = () => {},
  onClickDownload = () => {},
  visibleOnInit = false,
  ...props
}) => {
  const [visible, setVisible] = useState(visibleOnInit)

  const toggleMenuButton = <IconButton icon='gear' onClick={() => setVisible(!visible)} />

  const formContents =
    !visible
      ? toggleMenuButton
      : (
        <>
          <Divider />
          {props.children}
          <Divider />
          <Flex variant='forms.menu.actions'>
            <IconButton icon='download' onClick={onClickDownload} />
            {toggleMenuButton}
            <IconButton icon='dice' onClick={onClickRandom} />
          </Flex>
        </>
        )

  return (
    <Flex
      as='form'
      variant='forms.menu'
      sx={{
        borderRadius: visible ? '4px' : '16px',
        mb: visible ? 1 : 2,
        p: visible ? 1 : 0
      }}
      {...props}
    >
      {formContents}
    </Flex>
  )
}

export default ConfigMenu
