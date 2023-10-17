/* global Blob */

import paper, { Path, Point } from 'paper'
import { map, range, chain } from 'ramda'
import { ConfigField, ConfigMenu, Layout } from '../../components'
import { saveAs } from 'file-saver'
import { PaperOnFrame, PaperSetup, usePaper } from '../../effects'
import { useState } from 'react'
import * as tome from 'chromotome'
import { Box, Select, Slider } from 'theme-ui'
import * as R from 'ramda'

type RainbowCloudsState = Array<[paper.Point, paper.Path]>

const RainbowClouds: React.FC = () => {
  const [palette, setPalette] = useState(tome.getRandom())
  const [radius, setRadius] = useState(50)

  const setup: PaperSetup<RainbowCloudsState> = ({ project }) => {
    const { width, height } = project.view.bounds

    const xs = map(x => Math.floor(x * radius), range(0, (width + 0) / radius))
    const ys = map(y => Math.floor(y * radius), range(0, (height + 0) / radius))

    return chain(
      x =>
        map(y => {
          const point = new Point(x, y)
          const circle = new Path.Circle(point, radius)
          circle.fillColor = new paper.Color(palette.colors[Math.floor(x / radius + y / radius) % palette.colors.length])
          return [point, circle]
        }, ys),
      xs
    )
  }

  const onFrame: PaperOnFrame<RainbowCloudsState> = ({ project, event, state }) => {
    const { width, height } = project.view.bounds
    state.forEach(([center, circle], i) => {
      const cosinus = Math.cos(event.time * 3 + i)
      const sinus = Math.sin(event.time * 3 + i)
      circle.position.x = cosinus * (width / radius) + center.x
      circle.position.y = sinus * (height / radius) + center.y
      return [center, circle]
    })
    return state
  }

  const { canvasRef } = usePaper(setup, { onFrame })

  return (
    <Layout meta={{ title: 'Rainbow Clouds ' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        <ConfigMenu
          onSubmit={(event: React.FormEvent) => event.preventDefault()}
          onClickDownload={() => {
            const data = new Blob([paper.project.exportSVG({ asString: true }) as string], { type: 'image/svg+xml;charset=utf-8' })
            saveAs(data, 'Rainbow Clouds')
          }}
        >
          <ConfigField label={`Palette: ${palette.name}`} as={Select} name='palette' defaultValue={palette.name} onChange={({ target: { value } }) => setPalette(tome.get(value as tome.PaletteName))}>
            {tome.getNames().map(name => <option key={name}>{name}</option>)}
          </ConfigField>
          <ConfigField label={`Radius: ${radius}`} as={Slider} name='radius' defaultValue={radius} onChange={({ target: { value } }) => setRadius(Number.parseInt(value))} />
        </ConfigMenu>
      </Box>
    </Layout>
  )
}

export default RainbowClouds
