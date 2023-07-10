import { IconButton as OgIconButton, IconButtonProps as OgIconButtonProps } from 'theme-ui'
import Icon from './Icon'

export interface IconButtonProps extends OgIconButtonProps {
  icon: string
}

export const IconButton = ({ icon, ...props }: IconButtonProps): JSX.Element => (
  <OgIconButton
    {...props}
  >
    <Icon noun={icon} />
  </OgIconButton>
)

IconButton.propTypes = {
  icon: Icon.propTypes.noun
}

export default IconButton
