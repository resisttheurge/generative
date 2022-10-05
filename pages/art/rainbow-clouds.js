/* global Blob */

import paper, { Path, Point } from 'paper'
import { map, range, chain } from 'ramda'
import { IconButton, Layout } from '../../components'
import { saveAs } from 'file-saver'
import usePaper from '../../lib/usePaper'
import { useMemo, useState } from 'react'
import * as tome from 'chromotome'
import { Box, Button, Field, Select } from 'theme-ui'
import * as R from 'ramda'

const RainbowClouds = () => {
  const [configOpen, setConfigOpen] = useState(false)
  const [palette, setPalette] = useState(tome.getRandom())

  const setup = useMemo(() => () => {
    const { x: width, y: height } = paper.view.bounds.bottomRight
    console.log(width, height)
    const xs = map(x => Math.floor(x * 50), range(0, (width + 0) / 50))
    const ys = map(y => Math.floor(y * 50), range(0, (height + 0) / 50))

    const circles = chain(
      x =>
        map(y => {
          const point = new Point(x, y)
          const circle = new Path.Circle(point, 50)
          circle.fillColor = palette.colors[(x / 50 + y / 50) % palette.colors.length]
          return [point.clone(), circle]
        }, ys),
      xs
    )

    paper.view.onFrame = event => {
      circles.forEach(([center, circle], i) => {
        const cosinus = Math.cos(event.time * 3 + i)
        const sinus = Math.sin(event.time * 3 + i)
        circle.position.x = cosinus * (width / 50) + center.x
        circle.position.y = sinus * (height / 50) + center.y
      })
    }
    paper.view.update()
  }, [palette])

  const onResize = setup

  const { canvasRef } = usePaper(() => {}, { setup, onResize })

  return (
    <Layout meta={{ title: 'Rainbow Clouds ' }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        <Box
          as='form'
          sx={{
            variant: 'forms.form',
            top: 0,
            right: 0,
            position: 'absolute',
            opacity: configOpen ? 1 : 0,
            transition: 'opacity .25s ease-in-out'

          }}
          onSubmit={event => event.preventDefault()}
        >
          <Field label={`Palette: ${palette.name}`} as={Select} name='palette' defaultValue={palette.name} onChange={R.compose(setPalette, tome.get, R.prop('value'), R.prop('target'))}>
            {tome.getNames().map(name => <option key={name}>{name}</option>)}
          </Field>
          <Button
            variant='primary'
            sx={{
              justifySelf: 'stretch'
            }}
            onClick={() => {
              const data = new Blob([paper.project.exportSVG({ asString: true })], { type: 'image/svg+xml;charset=utf-8' })
              saveAs(data, 'Poisson Disk Sampling')
            }}
          >
            Save SVG
          </Button>
        </Box>
        <IconButton
          icon='gear'
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            opacity: 1
          }}
          onClick={() => setConfigOpen(!configOpen)}
        />
      </Box>
    </Layout>
  )
}

export default RainbowClouds
