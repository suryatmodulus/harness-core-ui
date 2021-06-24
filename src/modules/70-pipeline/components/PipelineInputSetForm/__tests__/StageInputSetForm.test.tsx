import React from 'react'
import { render } from '@testing-library/react'
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
    infrastructure: {},
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
    }
  },

  path: 'stages[1].stage.spec'
}

describe('stageinputset tests', () => {
  test('initial render', () => {
    const { container } = render(
      <TestWrapper>
        <StageInputSetForm {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
