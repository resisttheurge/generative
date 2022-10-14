/* global Blob */

import paper, { Path, Point } from 'paper'
import { map, range, chain } from 'ramda'
import { ConfigField, ConfigMenu, Layout } from '../../components'
import { saveAs } from 'file-saver'
import { usePaper } from '../../effects'
import { useState } from 'react'
import * as tome from 'chromotome'
import { Box, Select, Slider } from 'theme-ui'
import * as R from 'ramda'

const RainbowClouds = () => {
  const [palette, setPalette] = useState(tome.getRandom())
  const [radius, setRadius] = useState(50)

  const setup = ({ project, state }) => {
    const { width, height } = project.view.bounds

    const xs = map(x => Math.floor(x * radius), range(0, (width + 0) / radius))
    const ys = map(y => Math.floor(y * radius), range(0, (height + 0) / radius))

    return chain(
      x =>
        map(y => {
          const point = new Point(x, y)
          const circle = new Path.Circle(point, radius)
          circle.fillColor = palette.colors[Math.floor(x / radius + y / radius) % palette.colors.length]
          return [point, circle]
        }, ys),
      xs
    )
  }

  const onFrame = ({ project, event, state }) => {
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

  const { canvasRef } = usePaper({ setup, onFrame })

  return (
    <Layout meta={{ title: 'Rainbow Clouds ' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        <ConfigMenu
          onSubmit={event => event.preventDefault()}
          onClickDownload={() => {
            const data = new Blob([paper.project.exportSVG({ asString: true })], { type: 'image/svg+xml;charset=utf-8' })
            saveAs(data, 'Rainbow Clouds')
          }}
        >
          <ConfigField label={`Palette: ${palette.name}`} as={Select} name='palette' defaultValue={palette.name} onChange={R.compose(setPalette, tome.get, R.prop('value'), R.prop('target'))}>
            {tome.getNames().map(name => <option key={name}>{name}</option>)}
          </ConfigField>
          <ConfigField label={`Radius: ${radius}`} as={Slider} name='radius' defaultValue={radius} onChange={R.compose(setRadius, Number.parseInt, R.prop('value'), R.prop('target'))} />
        </ConfigMenu>
      </Box>
    </Layout>
  )
}

export default RainbowClouds
