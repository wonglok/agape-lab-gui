import Link from 'next/link'

export default function Index() {
  return (
    <div className='w-full h-full'>
      <div className='mx-4 mt-4 mb-3 text-3xl'>AGAPE LAB</div>
      <div className='mx-4 m4-3'>
        <div className='text-xl'>2022-02-22</div>
        <div className='text-sm'>
          <Link className='underline' href={'/blog/2022/02/22'}>
            Two Materials
          </Link>
        </div>
      </div>
    </div>
  )
}
