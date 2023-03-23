
import Link from 'next/link'
import { NavLink, Text } from 'theme-ui'
import { Themed } from '@theme-ui/mdx'

const { ul: Ul, li: Li } = Themed

export const NavLinks = ({ title, links, ...props }) => (
  <>
    {title ? <Text variant='bold'>{title}</Text> : undefined}
    <Ul>
      {Object.entries(links)
        .map(
          ([key, value]) => (
            <Li
              key={typeof value === 'string' ? value : key}
              sx={{
                my: 2
              }}
            >
              {
                typeof value === 'string'
                  ? <Link href={value} passHref><NavLink>{key}</NavLink></Link>
                  : <NavLinks title={key} links={value} />
              }
            </Li>
          )
        )}
    </Ul>
  </>
)

export default NavLinks
