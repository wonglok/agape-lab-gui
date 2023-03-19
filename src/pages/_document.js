import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <script
          data-partytown-config
          dangerouslySetInnerHTML={{
            __html: `
              window.remoteImport = (v) => import(v)
            `,
          }}
        />
      </Head>
      <body>
        <noscript>
          <iframe
            src='https://www.googletagmanager.com/ns.html?id=GTM-WQVG99Q'
            height='0'
            width='0'
            style={{
              display: `none`,
              visibility: `hidden`,
            }}></iframe>
        </noscript>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
