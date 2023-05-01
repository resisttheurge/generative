import { ComponentPropsWithoutRef, ElementType } from 'react'
import {
  Flex,
  Label,
  Input
} from 'theme-ui'
import IconButton from '../IconButton'

export interface ConfigFieldProps<C extends ElementType> {
  label: string
  name: string
  as?: C
  randomizable?: boolean
}

export const ConfigField = <C extends ElementType = typeof Input> ({
  as,
  randomizable = false,
  label,
  name,
  ...additionalProps
}: ConfigFieldProps<C> & Omit<ComponentPropsWithoutRef<C>, keyof ConfigFieldProps<C>>): JSX.Element => {
  const Control = as === undefined || as === null ? Input : as
  return (
    <Flex variant='forms.menu.field'>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Label htmlFor={name}>{label}</Label>
        {randomizable ? <IconButton icon='dice' /> : undefined}
      </Flex>
      <Control id={name} name={name} {...additionalProps} />
    </Flex>
  )
}

ConfigField.displayName = 'ConfigField'

export default ConfigField
