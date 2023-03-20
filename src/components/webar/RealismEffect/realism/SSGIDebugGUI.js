// import { SSGIEffect } from 'realism-effects'
import Pane from 'tweakpane'
import copy from 'copy-to-clipboard'

export class SSGIDebugGUI {
  //SSGIEffect.DefaultOptions
  constructor(ssgiEffect, params = {}) {
    const pane = new Pane()
    this.pane = pane
    pane.containerElem_.style.userSelect = 'none'
    pane.containerElem_.style.width = '380px'

    // let { lightParams, refreshLighting } = others

    // const lightingFolder = pane.addFolder({ title: 'Lighting' })
    // lightingFolder.addInput(lightParams, 'yaw', { min: -Math.PI, max: Math.PI, step: 0.01 }).on('change', (ev) => {
    //   refreshLighting()
    // })
    // lightingFolder.addInput(lightParams, 'pitch', { min: -Math.PI, max: Math.PI, step: 0.01 }).on('change', (ev) => {
    //   refreshLighting()
    // })
    // lightingFolder
    //   .addInput(lightParams, 'intensity', { min: -Math.PI, max: Math.PI, step: 0.01 })
    //   .on('change', (ev) => {
    //     refreshLighting()
    //   })

    // params = { ...SSGIEffect.DefaultOptions, ...params }

    const generalFolder = pane.addFolder({ title: 'General' })
    generalFolder.addInput(params, 'distance', { min: 0.001, max: 20, step: 0.01 }).on('change', (ev) => {
      ssgiEffect['distance'] = ev
    })

    generalFolder.addInput(params, 'autoThickness').on('change', (ev) => {
      ssgiEffect['autoThickness'] = ev
    })
    generalFolder
      .addInput(params, 'thickness', {
        min: 0,
        max: 5,
        step: 0.01,
      })
      .on('change', (ev) => {
        ssgiEffect['thickness'] = ev
      })

    generalFolder.addInput(params, 'maxRoughness', { min: 0, max: 1, step: 0.01 }).on('change', (ev) => {
      ssgiEffect['maxRoughness'] = ev
    })
    generalFolder.addInput(params, 'envBlur', { min: 0, max: 1, step: 0.01 }).on('change', (ev) => {
      ssgiEffect['envBlur'] = ev
    })
    generalFolder.addInput(params, 'importanceSampling').on('change', (ev) => {
      ssgiEffect['importanceSampling'] = ev
    })
    generalFolder.addInput(params, 'maxEnvLuminance', { min: 0, max: 100, step: 1 }).on('change', (ev) => {
      ssgiEffect['maxEnvLuminance'] = ev
    })

    const temporalResolveFolder = pane.addFolder({ title: 'Temporal Resolve' })

    temporalResolveFolder.addInput(params, 'blend', { min: 0, max: 1, step: 0.001 }).on('change', (ev) => {
      ssgiEffect['blend'] = ev
    })
    const denoiseFolder = pane.addFolder({ title: 'Denoise' })

    denoiseFolder.addInput(params, 'denoiseIterations', { min: 0, max: 5, step: 1 }).on('change', (ev) => {
      ssgiEffect['denoiseIterations'] = ev
    })
    denoiseFolder.addInput(params, 'denoiseKernel', { min: 1, max: 5, step: 1 }).on('change', (ev) => {
      ssgiEffect['denoiseKernel'] = ev
    })
    denoiseFolder
      .addInput(params, 'denoiseDiffuse', {
        min: 0,
        max: 50,
        step: 0.01,
      })
      .on('change', (ev) => {
        ssgiEffect['denoiseDiffuse'] = ev
      })
    denoiseFolder
      .addInput(params, 'denoiseSpecular', {
        min: 0,
        max: 50,
        step: 0.01,
      })
      .on('change', (ev) => {
        ssgiEffect['denoiseSpecular'] = ev
      })
    denoiseFolder
      .addInput(params, 'depthPhi', {
        min: 0,
        max: 15,
        step: 0.001,
      })
      .on('change', (ev) => {
        ssgiEffect['depthPhi'] = ev
      })
    denoiseFolder
      .addInput(params, 'normalPhi', {
        min: 0,
        max: 50,
        step: 0.001,
      })
      .on('change', (ev) => {
        ssgiEffect['normalPhi'] = ev
      })
    denoiseFolder
      .addInput(params, 'roughnessPhi', {
        min: 0,
        max: 100,
        step: 0.001,
      })
      .on('change', (ev) => {
        ssgiEffect['roughnessPhi'] = ev
      })

    const definesFolder = pane.addFolder({ title: 'Tracing' })

    definesFolder.addInput(params, 'steps', { min: 0, max: 256, step: 1 }).on('change', (ev) => {
      ssgiEffect['steps'] = ev
    })
    definesFolder.addInput(params, 'refineSteps', { min: 0, max: 16, step: 1 }).on('change', (ev) => {
      ssgiEffect['refineSteps'] = ev
    })
    definesFolder.addInput(params, 'spp', { min: 1, max: 32, step: 1 }).on('change', (ev) => {
      ssgiEffect['spp'] = ev
    })
    definesFolder.addInput(params, 'missedRays').on('change', (ev) => {
      ssgiEffect['missedRays'] = ev
    })

    const resolutionFolder = pane.addFolder({ title: 'Resolution', expanded: false })
    resolutionFolder.addInput(params, 'resolutionScale', { min: 0.25, max: 1, step: 0.25 }).on('change', (ev) => {
      ssgiEffect['resolutionScale'] = ev
    })

    pane
      .addButton({
        title: 'Copy to Clipboard',
      })
      .on('click', () => {
        //
        const json = {}

        for (const prop of Object.keys(params)) {
          json[prop] = ssgiEffect[prop]
        }

        const output = JSON.stringify(json, null, 2)
        copy(output)
      })

    this.clean = () => {
      pane.dispose()
    }
  }
}
