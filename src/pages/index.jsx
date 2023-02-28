import md5 from 'md5'
import { v4 } from 'uuid'
import Link from 'next/link'
import path from 'path'

const pages = [
  {
    key: md5(v4()),
    url: `/blog/2022/02/28/ball2k`,
    name: `dragon-ball-mech-2k`,
    date: '2022-02-28',
  },
  {
    key: md5(v4()),
    url: `https://agape-ecosystem.vercel.app/lab/graphics`,
    name: `shader-editor`,
    date: '2022-02-23',
  },
  {
    key: md5(v4()),
    url: `/blog/2022/02/22/substance-painter`,
    name: `substance-painter`,
    date: '2022-02-22',
  },
]

// importAll(require.context('./blog', true, /\.jsx$/))

export default function Index() {
  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='mx-4 mt-4 mb-1 text-3xl text-left'>AGAPE LAB</div>
      <div className='mx-4 mb-3 text-xl text-left'>愛加倍 實驗室</div>

      <div className='mb-4' style={{ height: '50vmin', width: '50vmin' }}>
        <svg className='w-full h-full' width='800px' height='800px' viewBox='0 0 800 800' version='1.1'>
          <g id='Extra-Small' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
            <rect fill='#FFA7EE' x='0' y='0' width='800' height='800'></rect>
            <g id='LAB' transform='translate(113.000000, 366.000000)' fill='#05109F' fillRule='nonzero'>
              <path
                d='M12.0793893,0 L36.2381679,0 C39.5643766,0 42.4091603,1.18285714 44.7725191,3.54857143 C47.1358779,5.91428571 48.3175573,8.84952381 48.3175573,12.3542857 L48.3175573,147.725714 L159.920611,147.725714 C163.246819,147.725714 166.091603,148.908571 168.454962,151.274286 C170.818321,153.64 172,156.487619 172,159.817143 L172,171.908571 C172,175.238095 170.818321,178.085714 168.454962,180.451429 C166.091603,182.817143 163.246819,184 159.920611,184 L12.0793893,184 C8.75318066,184 5.90839695,182.860952 3.54503817,180.582857 C1.18167939,178.304762 0,175.500952 0,172.171429 L0,12.3542857 C0,8.84952381 1.18167939,5.91428571 3.54503817,3.54857143 C5.90839695,1.18285714 8.75318066,0 12.0793893,0 Z'
                id='Path'></path>
              <path
                d='M179.437859,172.171429 L211.75188,49.9428571 C220.509067,16.647619 248.882353,0 296.871738,0 L365.965944,0 C369.118532,0 371.745688,1.18285714 373.847413,3.54857143 C375.949138,5.91428571 377,8.67428571 377,11.8285714 L377,172.171429 C377,175.500952 375.81778,178.304762 373.453339,180.582857 C371.088899,182.860952 368.242813,184 364.915082,184 L340.745245,184 C337.242371,184 334.352499,182.860952 332.07563,180.582857 C329.798762,178.304762 328.660327,175.413333 328.660327,171.908571 L328.660327,139.577143 L237.49801,139.577143 L228.828395,171.908571 C227.952676,175.413333 226.026095,178.304762 223.048651,180.582857 C220.071207,182.860952 216.91862,184 213.590889,184 L188.37019,184 C185.042459,184 182.502875,182.860952 180.751437,180.582857 C179,178.304762 178.562141,175.500952 179.437859,172.171429 Z M258.252543,62.0342857 L246.955772,103.302857 L328.660327,103.302857 L328.660327,36.2742857 L292.142857,36.2742857 C283.911101,36.2742857 276.730208,38.5961905 270.600177,43.24 C264.470146,47.8838095 260.354268,54.1485714 258.252543,62.0342857 Z'
                id='Shape'></path>
              <path
                d='M384,171.908571 L384,12.0914286 C384,8.76190476 385.17931,5.91428571 387.537931,3.54857143 C389.896552,1.18285714 392.735632,0 396.055172,0 L500.096552,0 C511.802299,0 522.45977,1.62095238 532.068966,4.86285714 C541.678161,8.1047619 549.845977,13.8 556.572414,21.9485714 C563.298851,30.0971429 566.662069,40.2171429 566.662069,52.3085714 C566.662069,65.4514286 560.896552,76.7542857 549.365517,86.2171429 C565.788506,94.9790476 574,109.173333 574,128.8 C574,146.32381 567.448276,159.904762 554.344828,169.542857 C541.241379,179.180952 525.167816,184 506.124138,184 L396.055172,184 C392.735632,184 389.896552,182.817143 387.537931,180.451429 C385.17931,178.085714 384,175.238095 384,171.908571 Z M500.62069,34.6971429 L432.22069,34.6971429 L432.22069,71.4971429 L500.62069,71.4971429 C506.036782,71.4971429 510.36092,69.8761905 513.593103,66.6342857 C516.825287,63.392381 518.441379,58.88 518.441379,53.0971429 C518.441379,47.3142857 516.825287,42.8019048 513.593103,39.56 C510.36092,36.3180952 506.036782,34.6971429 500.62069,34.6971429 Z M505.337931,105.142857 L432.22069,105.142857 L432.22069,149.302857 L505.337931,149.302857 C511.977011,149.302857 517.043678,147.331429 520.537931,143.388571 C524.032184,139.445714 525.77931,134.057143 525.77931,127.222857 C525.77931,120.388571 524.032184,115 520.537931,111.057143 C517.043678,107.114286 511.977011,105.142857 505.337931,105.142857 Z'
                id='Shape'></path>
            </g>
            <g id='AGAPE' transform='translate(113.000000, 250.000000)' fill='#05109F' fillRule='nonzero'>
              <path
                d='M0.245466608,96.3785714 L18.3609023,27.9571429 C23.2702344,9.31904762 39.1764706,0 66.0796108,0 L104.814241,0 C106.581601,0 108.054401,0.662142857 109.23264,1.98642857 C110.41088,3.31071429 111,4.85571429 111,6.62142857 L111,96.3785714 C111,98.242381 110.33724,99.8119048 109.01172,101.087143 C107.686201,102.362381 106.090668,103 104.225122,103 L90.6753649,103 C88.711632,103 87.0915524,102.362381 85.8151261,101.087143 C84.5386997,99.8119048 83.9004865,98.1933333 83.9004865,96.2314286 L83.9004865,78.1328571 L32.7943388,78.1328571 L27.9341,96.2314286 C27.4431667,98.1933333 26.3631137,99.8119048 24.6939407,101.087143 C23.0247678,102.362381 21.2574082,103 19.391862,103 L5.2529854,103 C3.38743919,103 1.96373286,102.362381 0.981866431,101.087143 C0,99.8119048 -0.245466608,98.242381 0.245466608,96.3785714 Z M44.429456,34.7257143 L38.0964175,57.8271429 L83.9004865,57.8271429 L83.9004865,20.3057143 L63.4285714,20.3057143 C58.8137992,20.3057143 54.7881468,21.6054762 51.3516143,24.205 C47.9150818,26.8045238 45.6076957,30.3114286 44.429456,34.7257143 Z'
                id='Shape'></path>
              <path
                d='M208.36849,66.6892655 L192.183594,66.6892655 C190.319878,66.6892655 188.725911,66.0282486 187.401693,64.7062147 C186.077474,63.3841808 185.415365,61.7928437 185.415365,59.9322034 L185.415365,54.3502825 C185.415365,52.4896422 186.077474,50.8983051 187.401693,49.5762712 C188.725911,48.2542373 190.319878,47.5932203 192.183594,47.5932203 L228.231771,47.5932203 C230.095486,47.5932203 231.689453,48.2542373 233.013672,49.5762712 C234.337891,50.8983051 235,52.4896422 235,54.3502825 L235,62.2824859 C235,75.6986817 230.978299,86.0056497 222.934896,93.2033898 C214.891493,100.40113 203.071615,104 187.47526,104 L171.290365,104 C155.39974,104 143.212023,99.7156309 134.727214,91.1468927 C126.242405,82.5781544 122,69.5291902 122,52 C122,34.2749529 126.438585,21.1770245 135.315755,12.7062147 C144.192925,4.2354049 157.508681,0 175.263021,0 L191.300781,0 C201.894531,0 211.433811,2.52165725 219.91862,7.56497175 C228.403429,12.6082863 232.645833,18.9001883 232.645833,26.440678 C232.645833,29.2806026 231.812066,31.3126177 230.144531,32.5367232 C228.476997,33.7608286 226.858507,34.3728814 225.289062,34.3728814 L216.755208,34.3728814 C212.635417,34.3728814 209.398437,32.1205273 207.044271,27.6158192 C204.493924,22.7193974 198.412326,20.2711864 188.799479,20.2711864 L175.998698,20.2711864 C165.503038,20.2711864 158.391493,22.5235405 154.664062,27.0282486 C150.936632,31.5329567 149.072917,39.8568738 149.072917,52 C149.072917,63.9472693 150.740451,72.2222222 154.075521,76.8248588 C157.41059,81.4274953 163.394097,83.7288136 172.026042,83.7288136 L186.739583,83.7288136 C194.488715,83.7288136 200.006293,82.259887 203.292318,79.3220339 C206.578342,76.3841808 208.270399,72.173258 208.36849,66.6892655 Z'
                id='Path'></path>
              <path
                d='M236.245467,96.3785714 L254.360902,27.9571429 C259.270234,9.31904762 275.176471,0 302.079611,0 L340.814241,0 C342.581601,0 344.054401,0.662142857 345.23264,1.98642857 C346.41088,3.31071429 347,4.85571429 347,6.62142857 L347,96.3785714 C347,98.242381 346.33724,99.8119048 345.01172,101.087143 C343.686201,102.362381 342.090668,103 340.225122,103 L326.675365,103 C324.711632,103 323.091552,102.362381 321.815126,101.087143 C320.5387,99.8119048 319.900487,98.1933333 319.900487,96.2314286 L319.900487,78.1328571 L268.794339,78.1328571 L263.9341,96.2314286 C263.443167,98.1933333 262.363114,99.8119048 260.693941,101.087143 C259.024768,102.362381 257.257408,103 255.391862,103 L241.252985,103 C239.387439,103 237.963733,102.362381 236.981866,101.087143 C236,99.8119048 235.754533,98.242381 236.245467,96.3785714 Z M280.429456,34.7257143 L274.096418,57.8271429 L319.900487,57.8271429 L319.900487,20.3057143 L299.428571,20.3057143 C294.813799,20.3057143 290.788147,21.6054762 287.351614,24.205 C283.915082,26.8045238 281.607696,30.3114286 280.429456,34.7257143 Z'
                id='Shape'></path>
              <path
                d='M417.309958,20.3057143 L391.096774,20.3057143 L391.096774,59.74 L417.309958,59.74 C425.360449,59.74 431.47195,58.3911905 435.64446,55.6935714 C439.816971,52.9959524 441.903226,47.772381 441.903226,40.0228571 C441.903226,32.2733333 439.816971,27.0497619 435.64446,24.3521429 C431.47195,21.6545238 425.360449,20.3057143 417.309958,20.3057143 Z M370.626928,0 L425.556802,0 C454.518934,0 469,13.3409524 469,40.0228571 C469,66.7047619 454.518934,80.0457143 425.556802,80.0457143 L391.096774,80.0457143 L391.096774,96.2314286 C391.096774,98.0952381 390.434081,99.6892857 389.108696,101.013571 C387.78331,102.337857 386.187938,103 384.322581,103 L370.774194,103 C368.908836,103 367.313464,102.337857 365.988079,101.013571 C364.662693,99.6892857 364,98.0952381 364,96.2314286 L364,6.76857143 C364,4.9047619 364.638149,3.31071429 365.914446,1.98642857 C367.190743,0.662142857 368.761571,0 370.626928,0 Z'
                id='Shape'></path>
              <path
                d='M567.258015,0 C569.114504,0 570.70229,0.662142857 572.021374,1.98642857 C573.340458,3.31071429 574,4.9047619 574,6.76857143 L574,13.5371429 C574,15.4009524 573.340458,16.995 572.021374,18.3192857 C570.70229,19.6435714 569.114504,20.3057143 567.258015,20.3057143 L504.967939,20.3057143 L504.967939,41.2 L558.610687,41.2 C560.467176,41.2 562.054962,41.8621429 563.374046,43.1864286 C564.69313,44.5107143 565.352672,46.1047619 565.352672,47.9685714 L565.352672,54.7371429 C565.352672,56.6009524 564.69313,58.195 563.374046,59.5192857 C562.054962,60.8435714 560.467176,61.5057143 558.610687,61.5057143 L504.967939,61.5057143 L504.967939,82.6942857 L567.11145,82.6942857 C568.967939,82.6942857 570.531298,83.3319048 571.801527,84.6071429 C573.071756,85.882381 573.70687,87.4519048 573.70687,89.3157143 L573.70687,96.2314286 C573.70687,98.0952381 573.047328,99.6892857 571.728244,101.013571 C570.40916,102.337857 568.821374,103 566.964885,103 L484.741985,103 C482.885496,103 481.29771,102.337857 479.978626,101.013571 C478.659542,99.6892857 478,98.0461905 478,96.0842857 L478,6.62142857 C478,4.75761905 478.659542,3.18809524 479.978626,1.91285714 C481.29771,0.637619048 482.885496,0 484.741985,0 L567.258015,0 Z'
                id='Path'></path>
            </g>
          </g>
        </svg>
      </div>
      {pages.map((blog) => {
        return (
          <div className='mx-4 mb-3' key={blog.key}>
            <div className='text-xl'>{blog.name}</div>
            <div className='text-sm'>
              <a className='underline' target='_blank' href={`${blog.url}`} rel='noreferrer'>
                {blog.date}
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}
