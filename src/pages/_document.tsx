import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel='stylesheet' href='https://use.typekit.net/poe1fma.css' />
        <link
          rel='stylesheet'
          href='https://cdn.jsdelivr.net/npm/firacode@6.2.0/distr/fira_code.css'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
