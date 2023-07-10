import { light, dark } from './modes'

export const config = {
  initialColorModeName: 'light'
}

export const colors = {
  ...light,
  modes: {
    dark
  }
}
