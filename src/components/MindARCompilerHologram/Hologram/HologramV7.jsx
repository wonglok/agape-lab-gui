import { useEffect, useMemo, useRef, useState } from 'react'
import DepthKit, { VideoEl } from './concert_v7/depthkit'
import { useProfiles } from './useProfiles'
// import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
// import { useConcert } from './concert_v7/useConcert'

export function HologramV7WrapperProfile({ profile }) {
  let [st, setSt] = useState(false)
  useEffect(() => {
    let yo = async () => {
      try {
        //
        let holoGUIConfig = await fetch(`${profile.holoGUIUrl.baseURL}${profile.holoGUIUrl.downloadURL}`, {
          method: 'GET',
          mode: 'cors',
        }).then((r) => {
          return r.json()
        })

        let holoVideoUrl = `${profile.holoVideoUrl.baseURL}${profile.holoVideoUrl.downloadURL}`

        let holoPosterUrl = `${profile.holoPosterUrl.baseURL}${profile.holoPosterUrl.downloadURL}`

        let holoJsonUrl = `${profile.holoJsonUrl.baseURL}${profile.holoJsonUrl.downloadURL}`

        setSt({
          holoGUIConfig,
          holoVideoUrl,
          holoPosterUrl,
          holoJsonUrl,
        })
      } catch (e) {
        console.log(e)
      }
    }
    yo()
  }, [profile])

  return (
    <group>
      {st && (
        <HologramV7Content
          holoVideoUrl={st.holoVideoUrl}
          holoPosterUrl={st.holoPosterUrl}
          holoJsonUrl={st.holoJsonUrl}
          holoGUIConfig={st.holoGUIConfig}></HologramV7Content>
      )}
    </group>
  )
}

export function LoopThroughHolograms() {
  let cursor = useRef(1)

  let publicProfiles = useProfiles((r) => r.publicProfiles)

  useEffect(() => {
    let inter = () => {
      // useProfiles
      //   .getState()
      //   .loadPublicProfiles()
      //   .then((r) => {
      //     console.log(r)
      //     cursor.current = (cursor.current + 1) % r.length

      //     useProfiles.setState({ publicProfiles: r })
      //   })

      cursor.current = 0

      useProfiles.setState({
        publicProfiles: [
          {
            _id: '649cecd02852c45db9c7047b',
            displayName: 'Plus One Dimension',
            username: 'andrew',
            website: 'andrew.com',
            holoJsonUrl: {
              fields: {
                acl: 'public-read',
                'Content-Type': 'text/plain',
                bucket: 'agape-expo',
                'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
                'X-Amz-Credential': 'AKIA4NIS7NTXP4ITJKPP/20230629/ap-southeast-1/s3/aws4_request',
                'X-Amz-Date': '20230629T023047Z',
                key: 'expo2023/profile/lok/TAKE_02_25_16_51_09_md5_c75b4974acf0a583fcf6978d6fc63d4f.txt',
                Policy:
                  'eyJleHBpcmF0aW9uIjoiMjAyMy0wNi0yOVQwMjo0MDo0N1oiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMCwxNDMwMl0seyJhY2wiOiJwdWJsaWMtcmVhZCJ9LHsiQ29udGVudC1UeXBlIjoidGV4dC9wbGFpbiJ9LHsiYnVja2V0IjoiYWdhcGUtZXhwbyJ9LHsiWC1BbXotQWxnb3JpdGhtIjoiQVdTNC1ITUFDLVNIQTI1NiJ9LHsiWC1BbXotQ3JlZGVudGlhbCI6IkFLSUE0TklTN05UWFA0SVRKS1BQLzIwMjMwNjI5L2FwLXNvdXRoZWFzdC0xL3MzL2F3czRfcmVxdWVzdCJ9LHsiWC1BbXotRGF0ZSI6IjIwMjMwNjI5VDAyMzA0N1oifSx7ImtleSI6ImV4cG8yMDIzL3Byb2ZpbGUvbG9rL1RBS0VfMDJfMjVfMTZfNTFfMDlfbWQ1X2M3NWI0OTc0YWNmMGE1ODNmY2Y2OTc4ZDZmYzYzZDRmLnR4dCJ9XX0=',
                'X-Amz-Signature': 'a70c113a10b4e218115f3544a90643f806f6eebd533705912792b119adaeb7d1',
              },
              baseURL: 'https://agape-expo.s3.ap-southeast-1.amazonaws.com',
              downloadURL: '/expo2023/profile/lok/TAKE_02_25_16_51_09_md5_c75b4974acf0a583fcf6978d6fc63d4f.txt',
            },
            holoPosterUrl: {
              fields: {
                acl: 'public-read',
                'Content-Type': 'image/png',
                bucket: 'agape-expo',
                'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
                'X-Amz-Credential': 'AKIA4NIS7NTXP4ITJKPP/20230629/ap-southeast-1/s3/aws4_request',
                'X-Amz-Date': '20230629T023051Z',
                key: 'expo2023/profile/lok/TAKE_02_25_16_51_09_md5_375aeb1bd7fffc0daad197d7b7c9e3f9.png',
                Policy:
                  'eyJleHBpcmF0aW9uIjoiMjAyMy0wNi0yOVQwMjo0MDo1MVoiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMCwzMTAxOTM1XSx7ImFjbCI6InB1YmxpYy1yZWFkIn0seyJDb250ZW50LVR5cGUiOiJpbWFnZS9wbmcifSx7ImJ1Y2tldCI6ImFnYXBlLWV4cG8ifSx7IlgtQW16LUFsZ29yaXRobSI6IkFXUzQtSE1BQy1TSEEyNTYifSx7IlgtQW16LUNyZWRlbnRpYWwiOiJBS0lBNE5JUzdOVFhQNElUSktQUC8yMDIzMDYyOS9hcC1zb3V0aGVhc3QtMS9zMy9hd3M0X3JlcXVlc3QifSx7IlgtQW16LURhdGUiOiIyMDIzMDYyOVQwMjMwNTFaIn0seyJrZXkiOiJleHBvMjAyMy9wcm9maWxlL2xvay9UQUtFXzAyXzI1XzE2XzUxXzA5X21kNV8zNzVhZWIxYmQ3ZmZmYzBkYWFkMTk3ZDdiN2M5ZTNmOS5wbmcifV19',
                'X-Amz-Signature': '1b4178115c8952ea51ee7055196e22ef6fb2edf3a38e7cb474c40be39926cae8',
              },
              baseURL: 'https://agape-expo.s3.ap-southeast-1.amazonaws.com',
              downloadURL: '/expo2023/profile/lok/TAKE_02_25_16_51_09_md5_375aeb1bd7fffc0daad197d7b7c9e3f9.png',
            },
            holoVideoUrl: {
              fields: {
                acl: 'public-read',
                'Content-Type': 'video/mp4',
                bucket: 'agape-expo',
                'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
                'X-Amz-Credential': 'AKIA4NIS7NTXP4ITJKPP/20230629/ap-southeast-1/s3/aws4_request',
                'X-Amz-Date': '20230629T023053Z',
                key: 'expo2023/profile/lok/TAKE_02_25_16_51_09_md5_27468bd5eb6a12e2b34db19549e71566.mp4',
                Policy:
                  'eyJleHBpcmF0aW9uIjoiMjAyMy0wNi0yOVQwMjo0MDo1M1oiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMCwzMDE1NTE2XSx7ImFjbCI6InB1YmxpYy1yZWFkIn0seyJDb250ZW50LVR5cGUiOiJ2aWRlby9tcDQifSx7ImJ1Y2tldCI6ImFnYXBlLWV4cG8ifSx7IlgtQW16LUFsZ29yaXRobSI6IkFXUzQtSE1BQy1TSEEyNTYifSx7IlgtQW16LUNyZWRlbnRpYWwiOiJBS0lBNE5JUzdOVFhQNElUSktQUC8yMDIzMDYyOS9hcC1zb3V0aGVhc3QtMS9zMy9hd3M0X3JlcXVlc3QifSx7IlgtQW16LURhdGUiOiIyMDIzMDYyOVQwMjMwNTNaIn0seyJrZXkiOiJleHBvMjAyMy9wcm9maWxlL2xvay9UQUtFXzAyXzI1XzE2XzUxXzA5X21kNV8yNzQ2OGJkNWViNmExMmUyYjM0ZGIxOTU0OWU3MTU2Ni5tcDQifV19',
                'X-Amz-Signature': '5105c8413287d0d8ab4452db2049ed3d399b7140820fab42fce1533567cee72e',
              },
              baseURL: 'https://agape-expo.s3.ap-southeast-1.amazonaws.com',
              downloadURL: '/expo2023/profile/lok/TAKE_02_25_16_51_09_md5_27468bd5eb6a12e2b34db19549e71566.mp4',
            },
            holoGUIUrl: {
              fields: {
                acl: 'public-read',
                'Content-Type': 'application/json',
                bucket: 'agape-expo',
                'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
                'X-Amz-Credential': 'AKIA4NIS7NTXP4ITJKPP/20230707/ap-southeast-1/s3/aws4_request',
                'X-Amz-Date': '20230707T060418Z',
                key: 'expo2023/profile/andrew/gui_md5_9770fe836f02ef155dbc713b59b5dd40.json',
                Policy:
                  'eyJleHBpcmF0aW9uIjoiMjAyMy0wNy0wN1QwNjoxNDoxOFoiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMCwzNzI0XSx7ImFjbCI6InB1YmxpYy1yZWFkIn0seyJDb250ZW50LVR5cGUiOiJhcHBsaWNhdGlvbi9qc29uIn0seyJidWNrZXQiOiJhZ2FwZS1leHBvIn0seyJYLUFtei1BbGdvcml0aG0iOiJBV1M0LUhNQUMtU0hBMjU2In0seyJYLUFtei1DcmVkZW50aWFsIjoiQUtJQTROSVM3TlRYUDRJVEpLUFAvMjAyMzA3MDcvYXAtc291dGhlYXN0LTEvczMvYXdzNF9yZXF1ZXN0In0seyJYLUFtei1EYXRlIjoiMjAyMzA3MDdUMDYwNDE4WiJ9LHsia2V5IjoiZXhwbzIwMjMvcHJvZmlsZS9hbmRyZXcvZ3VpX21kNV85NzcwZmU4MzZmMDJlZjE1NWRiYzcxM2I1OWI1ZGQ0MC5qc29uIn1dfQ==',
                'X-Amz-Signature': '02de1156012d591a8aa5a09c605004f701fb0e8ee5858ed7f387cc7e81e36cf8',
              },
              baseURL: 'https://agape-expo.s3.ap-southeast-1.amazonaws.com',
              downloadURL: '/expo2023/profile/andrew/gui_md5_9770fe836f02ef155dbc713b59b5dd40.json',
            },
            readyPlayerMeUrl: '',
            __v: 0,
          },
        ],
      })
    }
    inter()
    // let tt = setInterval(inter, 10 * 1000)

    return () => {
      // clearInterval(tt)
    }
  }, [])

  let ref = useRef()
  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.lookAt(camera.position)
    }
  })

  // useEffect(() => {
  //   //
  //   let doWork = () => {}

  //   let tt = setInterval(doWork, 1000 * 20)

  //   return () => {
  //     clearInterval(tt)
  //   }
  // }, [publicProfiles])
  // let str = publicProfiles[cursor.current]?.displayName?.toUpperCase().slice(0, 30)
  // useEffect(() => {
  //   useProfiles.setState({ onAir: str })
  // }, [str])

  return (
    <>
      {/* <Text
        scale={0.5}
        color={'red'}
        outlineColor={'white'}
        outlineWidth={0.01}
        ref={ref}
        position={[0, 0.7, 0]}
        fontSize={1}
      >
        ON AIR: {str}
      </Text> */}

      <group rotation={[0, Math.PI * 0.75, 0]} position={[0, 0, 0]} scale={1}>
        {publicProfiles[cursor.current] && (
          <>
            <HologramV7WrapperProfile
              key={publicProfiles[cursor.current]?._id}
              profile={publicProfiles[cursor.current]}></HologramV7WrapperProfile>
          </>
        )}
      </group>

      {/*  */}

      {/*  */}
    </>
  )
}

export function HologramV7Content({ holoVideoUrl, holoPosterUrl, holoJsonUrl, holoGUIConfig }) {
  let { kit } = useMemo(() => {
    // if (typeof window === 'undefined') {
    //   return { kit: null }
    // }

    DepthKit.buildGeomtery()

    let video = new VideoEl({
      _movie: holoVideoUrl, //'/assets/2023-05-16-b/box/TAKE_02_25_16_49_08.mp4',
      _poster: holoPosterUrl, //'/assets/2023-05-16-b/box/TAKE_02_25_16_49_08.png',
    })

    let kit = new DepthKit(`points`, video, holoJsonUrl)

    document.body.addEventListener('click', () => {
      kit.depthkit.play()
    })

    kit.setLoop(true)

    let yo = setInterval(() => {
      if (kit) {
        kit.update()

        kit.allMaterials.forEach((m) => {
          m.uniforms.merger.value = 0
        })

        if (kit.props) {
          //

          kit.props.perspectives.forEach((prop, idx) => {
            if (kit[`sync${idx}`]) {
              kit.traverse((it) => {
                let json = holoGUIConfig

                for (let i = 0; i < 10; i++) {
                  if (it.name === 'mesh' + i) {
                    let fd = json.feed[i]

                    if (!fd) {
                      return
                    }

                    it.myParent.position.fromArray(fd.position)
                    it.myParent.rotation.fromArray(fd.rotation)
                  }
                }
              })

              holoGUIConfig.feed.forEach((it) => {
                kit.dict.set(it.idx, { slots: kit.lookup[it.chosenIDX] })
              })
              kit[`sync${idx}`]()
            }
          })
        }
      }

      // load(useConcert.getState())
    })

    kit.frustumCulled = false

    return {
      kit,
      yo,
    }
  }, [holoVideoUrl, holoPosterUrl, holoJsonUrl, holoGUIConfig])

  useEffect(() => {
    return () => {
      kit.dispose()
    }
  }, [kit])
  return (
    <>
      <group position={[0, 0, 0]}>{kit && <primitive object={kit}></primitive>}</group>
    </>
  )
}
