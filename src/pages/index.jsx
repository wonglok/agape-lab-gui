import dynamic from 'next/dynamic'
import Link from 'next/link'
import path from 'path'
const cache = []

function importAll(r) {
  r.keys().forEach((key) => {
    let url = key.replace('src/', '')
    url = url.replace('pages/blog', '')
    url = url.replace('./', '')
    if (url[0] === '/') {
      url = url.replace('/', '')
    }

    if (!cache.some((r) => r.key === url)) {
      cache.push({
        key: url,
        url: url.replace('.jsx', ''),
        date: path.dirname(url).split('/').join('-'),
        name: path.basename(url).replace('.jsx', ''),
        compos: dynamic(
          async () => {
            return r(key)
          },
          { ssr: true },
        ),
      })
    }
  })
}

importAll(require.context('./blog', true, /\.jsx$/, 'lazy'))

export default function Index() {
  return (
    <div className='w-full h-full'>
      <div className='mx-4 mt-4 mb-3 text-3xl'>AGAPE LAB</div>
      {cache.map((blog) => {
        return (
          <div className='mx-4 mb-3' key={blog.key}>
            <div className='text-xl'>{blog.date}</div>
            <div className='text-sm'>
              <Link className='underline' href={`${'/blog/'}${blog.url}`}>
                {blog.name}
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
