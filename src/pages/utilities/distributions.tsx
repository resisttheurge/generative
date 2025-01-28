import { PaperOnFrame, PaperSetup, useGenerators, usePaper } from 'effects'
import saveAs from 'file-saver'
import { Box, Input, Select, Slider, useThemeUI } from 'theme-ui'
import { useState } from 'react'
import paper from 'paper'

import { ConfigField, ConfigMenu, Layout } from 'components'
import {
  ANONYMOUS_PRNG_NAME,
  JSF32a,
  JSF32b,
  Mulberry32,
  PRNG,
  SFC32a,
  SFC32b,
  SFC32c,
  Splitmix32a,
  Splitmix32b,
} from 'lib/prngs'
import { xmur3a } from 'lib/hashers'
import { Generator } from '@generators/Generator'
import { extractColorOrElse } from '@utils/theme-ui-utils'
import { gaussian } from '@generators/gaussians'
import { pareto } from '@generators/power-laws'

const prngs = {
  jsf32a: new JSF32a(xmur3a),
  jsf32b: new JSF32b(xmur3a),
  mulberry32: new Mulberry32(xmur3a),
  sfc32a: new SFC32a(xmur3a),
  sfc32b: new SFC32b(xmur3a),
  sfc32c: new SFC32c(xmur3a),
  splitmix32a: new Splitmix32a(xmur3a),
  splitmix32b: new Splitmix32b(xmur3a),
}

const prngNames = Object.keys(prngs)

type Dimension = '1d' | '2d'
const dimensions: Dimension[] = ['1d', '2d']

type Orientation = 'horizontal' | 'vertical'
const orientations: Orientation[] = ['horizontal', 'vertical']

type Distribution = 'uniform' | 'gaussian' | 'pareto'
const distributions: Distribution[] = ['uniform', 'gaussian', 'pareto']

export const PRNGTest: React.FC = () => {
  const theme = useThemeUI()
  const [prng, setPRNG] = useState<PRNG<any>>(prngs.jsf32a) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [seed, setSeed] = useState('see num, be num')
  const [variant, setVariant] = useState(0)
  const [distribution, setDistribution] = useState<Distribution>('uniform')
  const [dimension, setDimension] = useState<Dimension>('1d')
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [samples, setSamples] = useState(100)
  const [drawTime, setDrawTime] = useState(5)

  const rate = samples / drawTime

  const { generate } = useGenerators<any>(seed, { prng, offset: variant }) // eslint-disable-line @typescript-eslint/no-explicit-any

  interface PaperState {
    definition: paper.SymbolDefinition
    generator: Generator<[number, number]>
    symbols: number
  }

  const setup: PaperSetup<PaperState> = ({
    project: {
      view: {
        bounds: { width, height },
      },
    },
  }) => {
    const item: paper.Item =
      dimension === '2d'
        ? new paper.Path.Rectangle([0, 0], [1, 1])
        : orientation === 'horizontal'
          ? new paper.Path.Line([0, 0], [0, 2 * height])
          : new paper.Path.Line([0, 0], [2 * width, 0])
    item.strokeColor = new paper.Color(
      extractColorOrElse(theme.theme.rawColors?.text, 'black'),
    )

    const definition = new paper.SymbolDefinition(item)
    const distGenerator =
      distribution === 'uniform'
        ? Generator.uniform
        : distribution === 'gaussian'
          ? gaussian({ normalize: true })
          : pareto(10, 1, 2).map(x => x - 1)
    const widthGenerator = Generator.nat(width, distGenerator)
    const heightGenerator = Generator.nat(height, distGenerator)

    const generator =
      dimension === '2d'
        ? Generator.tuple([widthGenerator, heightGenerator])
        : orientation === 'horizontal'
          ? Generator.tuple([widthGenerator, Generator.constant(0)])
          : Generator.tuple([Generator.constant(0), heightGenerator])

    return {
      definition,
      generator,
      symbols: 0,
    }
  }

  const onFrame: PaperOnFrame<PaperState> = ({ event, state }) => {
    if (state.symbols >= samples) {
      return state
    } else {
      const positions = generate(
        state.generator.repeat(
          Math.min(Math.ceil(rate * event.delta), samples - state.symbols),
        ),
      )
      positions.forEach(position => state.definition.place(position))
      return {
        ...state,
        symbols: state.symbols + positions.length,
      }
    }
  }

  const { canvasRef } = usePaper(setup, { onFrame })
  return (
    <Layout meta={{ title: 'Distributions' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
      </Box>
      <ConfigMenu
        onSubmit={(event: React.FormEvent) => event.preventDefault()}
        onClickDownload={() => {
          const data = new Blob(
            [paper.project.exportSVG({ asString: true }) as string],
            { type: 'image/svg+xml;charset=utf-8' },
          )
          saveAs(data, 'PRNGTest')
        }}
      >
        <ConfigField
          label={`PRNG: ${prng.name ?? ANONYMOUS_PRNG_NAME}`}
          as={Select}
          name='prng'
          defaultValue={prng.name}
          onChange={({ target: { value } }) => {
            const newPrng: PRNG<any> = prngs[value as keyof typeof prngs] // eslint-disable-line @typescript-eslint/no-explicit-any
            if (newPrng.hashState === undefined) {
              setVariant(0)
            }
            setPRNG(newPrng)
          }}
        >
          {prngNames.map(name => (
            <option key={name}>{name}</option>
          ))}
        </ConfigField>
        <ConfigField
          label='Seed'
          name='seed'
          value={seed}
          onChange={({ target: { value } }) => setSeed(value)}
        />
        {prng.hashState === undefined ? undefined : (
          <ConfigField
            label={`Variant: ${variant}`}
            as={Input}
            name='samples'
            type='number'
            min={0}
            step={1}
            value={variant}
            disabled={prng.hashState === undefined}
            onChange={({ target: { value } }) =>
              setVariant(Number.parseInt(value))
            }
          />
        )}
        <ConfigField
          label={`Distribution: ${distribution}`}
          as={Select}
          name='distribution'
          defaultValue={distribution}
          onChange={({ target: { value } }) =>
            setDistribution(value as Distribution)
          }
        >
          {distributions.map(name => (
            <option key={name}>{name}</option>
          ))}
        </ConfigField>
        <ConfigField
          label={`Dimension: ${dimension}`}
          as={Select}
          name='dimension'
          defaultValue={dimension}
          onChange={({ target: { value } }) => setDimension(value as Dimension)}
        >
          {dimensions.map(name => (
            <option key={name}>{name}</option>
          ))}
        </ConfigField>
        {dimension === '2d' ? undefined : (
          <ConfigField
            label='Orientation'
            as={Select}
            name='orientation'
            defaultValue={orientation}
            onChange={({ target: { value } }) =>
              setOrientation(value as Orientation)
            }
          >
            {orientations.map(name => (
              <option key={name}>{name}</option>
            ))}
          </ConfigField>
        )}
        <ConfigField
          label={`Samples: ${samples}`}
          as={Slider}
          name='samples'
          min={100}
          max={10000}
          step={100}
          value={samples}
          onChange={({ target: { value } }) =>
            setSamples(Number.parseInt(value))
          }
        />
        <ConfigField
          label={`Draw Time: ${drawTime}s`}
          as={Slider}
          name='bands'
          min={1}
          max={10}
          step={0.5}
          value={drawTime}
          onChange={({ target: { value } }) =>
            setDrawTime(Number.parseFloat(value))
          }
        />
      </ConfigMenu>
    </Layout>
  )
}

export default PRNGTest
