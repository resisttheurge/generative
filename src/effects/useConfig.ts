import { Generator } from '@generators/Generator'

export interface PropertyDefinition<Value> {
  readonly defaultValue: Value | Generator<Value>
  readonly generator?: Generator<Value>
  readonly format: (value: Value) => string
  readonly parse: (value: string) => Value
  readonly validate?: (value: Value) => boolean
}

export interface UsePropertyHandle <Value> {
  readonly value: Value
  readonly formatted: string
  readonly locked: boolean
  readonly set: (value: Value) => void
  readonly generate: () => void
  readonly toggleLock: () => void
}

export type ConfigDefinition <Config> =
  { readonly [Key in keyof Config]: PropertyDefinition<Config[Key]> }

export type UseConfigHandle <Config> = {
  readonly [Key in keyof Config]: UsePropertyHandle<Config[Key]>

}

// export function useConfig <Config> (configDefinition: ConfigDefinition<Config>): UseConfigHandle<Config>
