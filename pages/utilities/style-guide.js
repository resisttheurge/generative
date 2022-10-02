import { TypeScale, TypeStyle, ColorPalette } from '@theme-ui/style-guide'
import { Layout } from '../../components'

export default (props) => (
  <Layout meta={{ title: 'Style Guide' }}>
    <TypeStyle fontFamily='display' fontWeight='display' lineHeight='display' sx={{ fontSize: 4 }}>Display (Crayonette DJR)</TypeStyle>
    <TypeScale fontFamily='display' fontWeight='display' lineHeight='display' />
    <TypeStyle fontFamily='heading' fontWeight='heading' lineHeight='heading' sx={{ fontSize: 4 }}>Heading (Maxwell Filmotype)</TypeStyle>
    <TypeScale fontFamily='heading' fontWeight='heading' lineHeight='heading' />
    <TypeStyle fontFamily='body' fontWeight='body' lineHeight='body' sx={{ fontSize: 4 }}>Body (Decoy)</TypeStyle>
    <TypeScale fontFamily='body' fontWeight='body' lineHeight='body' />
    <TypeStyle fontFamily='monospace' fontWeight='monospace' lineHeight='monospace' sx={{ fontSize: 4 }}>Monospace (Fira Code)</TypeStyle>
    <TypeScale fontFamily='monospace' fontWeight='monospace' lineHeight='monospace' />
    <ColorPalette />
  </Layout>
)
