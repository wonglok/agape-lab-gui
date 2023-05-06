import Header from '@/config'
import '@/styles/index.css'
import '@/styles/base.css'

export default function App({ Component, pageProps = { title: 'index' } }) {
  return (
    <>
      <Header title={pageProps.title} />
      <Component {...pageProps} />
    </>
  )
}
