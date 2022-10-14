import { forwardRef } from 'react'
import { Flex, Input, Label } from 'theme-ui'
import IconButton from '../IconButton'

export const ConfigField = forwardRef(({ as: Control = Input, randomizable = false, label, name, ...props }, ref) => {
  return (
    <Flex variant='forms.menu.field'>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Label htmlFor={name}>{label}</Label>
        {randomizable ? <IconButton icon='dice' /> : undefined}
      </Flex>
      <Control id={name} name={name} ref={ref} {...props} />
    </Flex>
  )
})

ConfigField.displayName = 'ConfigField'

export default ConfigField
