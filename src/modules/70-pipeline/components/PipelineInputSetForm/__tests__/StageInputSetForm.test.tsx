import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { StageInputSetForm } from '../StageInputSetForm'

const props = {
  deploymentStageTemplate: {
    serviceConfig: {
      stageOverrides: {
        artifacts: {
          primary: {
            spec: {
              connectorRef: '<+input'
            },
            type: 'Dockerhub' as const
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
