import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import type { IconName } from '@blueprintjs/core'
import { TestWrapper } from '@common/utils/testUtils'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepCommandsWithRef } from '../StepCommands'

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}

class StepOne extends Step<any> {
  protected type = StepType.Run
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): any {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<any>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}
const stepFactory = new StepFactory()
stepFactory.registerStep(new StepOne())

describe('<StepCommands /> tests', () => {
  test('renders ok', async () => {
    const { container } = render(
      <TestWrapper>
        <StepCommandsWithRef
          step={{
            identifier: 'testStep',
            name: 'testStep',
            type: 'Run',
            spec: {
              connectorRef: 'account.dockerdev',
              image: 'maven:3-openjdk-8',
              command: 'mvn clean compile war:war'
            }
          }}
          onChange={jest.fn()}
          stepsFactory={stepFactory}
          isStepGroup={false}
          isReadonly={false}
          ref={{ current: null }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('able to switch tab', async () => {
    const { queryByText, container } = render(
      <TestWrapper>
        <StepCommandsWithRef
          step={{
            identifier: 'testStep',
            name: 'testStep',
            type: 'Run',
            spec: {
              connectorRef: 'account.dockerdev',
              image: 'maven:3-openjdk-8',
              command: 'mvn clean compile war:war'
            }
          }}
          onChange={jest.fn()}
          stepsFactory={stepFactory}
          isStepGroup={false}
          isReadonly={false}
          ref={{ current: null }}
        />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(queryByText('advancedTitle') as HTMLElement)
    })
    expect(container).toMatchSnapshot()
  })
  test('renders ok without tabs', async () => {
    const { queryByText, container } = render(
      <TestWrapper>
        <StepCommandsWithRef
          step={{
            identifier: 'testStep',
            name: 'testStep',
            type: 'Run',
            spec: {
              connectorRef: 'account.dockerdev',
              image: 'maven:3-openjdk-8',
              command: 'mvn clean compile war:war'
            }
          }}
          onChange={jest.fn()}
          stepsFactory={stepFactory}
          isStepGroup={false}
          isReadonly={false}
          ref={{ current: null }}
          withoutTabs={true}
        />
      </TestWrapper>
    )
    expect(queryByText('advancedTitle')).toBeNull()
    expect(container).toMatchSnapshot()
  })
})
