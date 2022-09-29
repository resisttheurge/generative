import { Generator } from '../Generator'

export const flatten =
  generator =>
    Generator(
      state => {
        const [nextGenerator, nextState] = generator(state)
        return nextGenerator(nextState)
      }
    )
