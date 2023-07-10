const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    jsxImportSource: 'theme-ui',
    providerImportSource: '@mdx-js/react',
    remarkPlugins: [],
    rehypePlugins: []
  }
})
module.exports = withMDX({
  compiler: {
    emotion: true
  },
  // Append the default value with md extensions
  pageExtensions: ['tsx', 'mdx'],
  webpack (config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })

    return config
  }
})
