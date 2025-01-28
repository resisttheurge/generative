import { ComponentPropsWithoutRef, ElementType } from 'react'
import { Label, Input, Box, Text } from 'theme-ui'
import IconButton from '../IconButton'

export interface ConfigFieldProps<C extends ElementType> {
  label: string
  name: string
  as?: C
  randomizable?: boolean
}

export const ConfigField = <C extends ElementType = typeof Input>({
  as,
  randomizable = false,
  label,
  name,
  ...additionalProps
}: ConfigFieldProps<C> &
  Omit<
    ComponentPropsWithoutRef<C>,
    keyof ConfigFieldProps<C>
  >): JSX.Element => {
  const Control = as === undefined || as === null ? Input : as
  const leftGutter = <IconButton icon='dice' sx={{ gridArea: 'gutter' }} />
  const control = (
    <Box variant='forms.menu.field.control'>
      <Control id={name} name={name} {...additionalProps} />
    </Box>
  )
  return (
    <Box variant='forms.menu.field' as={Label} {...{ htmlFor: name }}>
      {randomizable ? leftGutter : null}
      <Text variant='forms.label' sx={{ gridArea: 'label' }}>
        {label}
      </Text>
      {control}
    </Box>
  )
}

ConfigField.displayName = 'ConfigField'

export default ConfigField
