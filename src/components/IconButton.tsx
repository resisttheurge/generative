import { Box, IconButton as OgIconButton, IconButtonProps as OgIconButtonProps } from 'theme-ui'
import Icon from './Icon'

export interface IconButtonProps extends OgIconButtonProps {
  icon: string
  fab?: boolean
}

export const IconButton = ({ icon, fab = false, ...props }: IconButtonProps): JSX.Element => {
  return (
    <OgIconButton
      variant={!fab ? 'buttons.icon' : 'buttons.fab'}
      {...props}
    >
      <Box variant='buttons.tint' />
      <Icon noun={icon} sx={{ gridArea: 'center' }} />
    </OgIconButton>
  )
}

IconButton.propTypes = {
  icon: Icon.propTypes.noun
}

export default IconButton
