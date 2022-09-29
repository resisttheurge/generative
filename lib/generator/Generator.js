export const symbol =
  Symbol('Stateful Function with shape state => [value, state]')

export const isGenerator =
  maybeGenerator =>
    typeof maybeGenerator === 'function' &&
    maybeGenerator[Generator.symbol] === true

export const Generator =
  generator =>
    Object.assign(
      generator,
      {
        [Generator.symbol]: true
      }
    )

Object.assign(
  Generator,
  {
    symbol,
    isGenerator
  }
)

Object.defineProperty(
  Generator,
  Symbol.hasInstance,
  { value: isGenerator }
)
