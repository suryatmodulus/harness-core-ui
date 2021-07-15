import React from 'react'
import { render } from '@testing-library/react'
import { merge } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { StageInputSetForm } from '../StageInputSetForm'

jest.mock('@common/utils/YamlUtils', () => ({}))

const props = {
  deploymentStageTemplate: {
    serviceConfig: {
      stageOverrides: {
        artifacts: {
          primary: {
            spec: {
              connectorRef: '<+input'
            },
            type: 'DockerRegistry' as const
          }
        }
      }
    },
    infrastructure: {
      spec: {
        namespace: 'test',
        serviceAccountName: 'name1',
        initTimeout: '1w'
      }
    },
    execution: {
      steps: [
        {
          step: {
            identifier: 'test',
            name: 'test',
            type: 'test',
            description: 'ts',
            timeout: '10m'
          }
        }
      ],
      rollbackSteps: []
    },
    serviceDependencies: [
      {
        identifier: 'dep1',
        name: 'dep1',
        type: 'Service',
        spec: {
          connectorRef: 'harnessImage',
          image: 'alpine'
        }
      }
    ]
  },
  deploymentStage: {
    execution: {
      steps: [
        {
          step: {
            identifier: 'test',
            name: 'test',
            type: 'test',
            description: 'ts',
            timeout: '10m'
          }
        }
      ],
      rollbackSteps: []
    },
    serviceDependencies: [
      {
        identifier: 'dep1',
        name: 'dep1',
        type: 'Service',
        spec: {
          connectorRef: 'harnessImage',
          image: 'alpine'
        }
      }
    ]
  },
  path: 'stages[1].stage.spec'
} as any

describe('stageinputset tests', () => {
  test('initial render', () => {
    const { container } = render(
      <TestWrapper>
        <StageInputSetForm {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('initial render2', () => {
    const formProps: any = merge({}, props)
    formProps.deploymentStageTemplate.infrastructure.spec = null
    const { container } = render(
      <TestWrapper>
        <StageInputSetForm {...merge({}, props)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
