import { IconButton as OgIconButton } from 'theme-ui'
import Icon from './Icon'

export const IconButton = ({ icon, ...props }) => (
  <OgIconButton
    {...props}
    sx={{
      p: 1,
      m: 2,
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <Icon noun={icon} />
  </OgIconButton>
)

IconButton.propTypes = {
  icon: Icon.propTypes.noun
}

export default IconButton
