import { cloneDeep } from 'lodash-es'
import { mayBeStripCIProps } from '../StageBuilderUtil'

const pipelineMock = {
  name: 'ci-test',
  identifier: 'citest',
  tags: {},
  stages: [
    {
      stage: {
        name: 'khlgj',
        identifier: 'khlgj',
        type: 'CI',
        spec: {
          cloneCodebase: true,
          execution: {
            steps: [
              {
                step: {
                  type: 'Run',
                  name: 'mkg',
                  identifier: 'mkg',
                  spec: {
                    connectorRef: 'harnessImage',
                    image: 'maven:3.6.3-jdk-8',
                    command: 'exit 1'
                  }
                }
              }
            ]
          },
          serviceDependencies: [],
          sharedPaths: [''],
          infrastructure: {
            type: 'KubernetesDirect',
            spec: {
              connectorRef: 'account.buildfarm',
              namespace: ''
            }
          }
        }
      }
    }
  ],
  projectIdentifier: 'bdevtest',
  orgIdentifier: 'default',
  properties: {
    ci: {
      codebase: {
        connectorRef: 'account.dushyant',
        build: '<+input>'
      }
    }
  }
}

describe('StageBuilderUtils tests', () => {
  describe('mayBeStripCIProps tests', () => {
    test('Does not do nothing if any stage has a CI prop', () => {
      const initialPipelineMock = cloneDeep(pipelineMock as any)
      expect(mayBeStripCIProps(initialPipelineMock)).toEqual(false)
      expect(initialPipelineMock).toEqual(initialPipelineMock)
    })
    test('Removes only ci prop if there are other props from properties', () => {
      const initialPipelineMock = cloneDeep(pipelineMock as any)
      initialPipelineMock.stages = initialPipelineMock.stages.filter(
        (stage: { stage: { type: string } }) => stage.stage.type !== 'CI'
      )
      initialPipelineMock.properties.cd = {
        'some-prop': true
      }
      const finalPipelineMock = cloneDeep(initialPipelineMock as any)
      delete finalPipelineMock.properties.ci
      expect(mayBeStripCIProps(initialPipelineMock)).toEqual(true)
      expect(initialPipelineMock).toEqual(finalPipelineMock)
    })
    test('Removes properties altogether if no CI stags exist', () => {
      const initialPipelineMock = cloneDeep(pipelineMock)
      initialPipelineMock.stages = initialPipelineMock.stages.filter(stage => stage.stage.type !== 'CI')
      const finalPipelineMock = cloneDeep(initialPipelineMock as any)
      delete finalPipelineMock.properties
      expect(mayBeStripCIProps(initialPipelineMock)).toEqual(true)
      expect(initialPipelineMock).toEqual(finalPipelineMock)
    })
  })
})
