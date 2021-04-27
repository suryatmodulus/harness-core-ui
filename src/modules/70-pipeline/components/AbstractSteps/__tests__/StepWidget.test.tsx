import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import type { IconName } from '@wings-software/uicore'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AbstractStepFactory } from '../AbstractStepFactory'
import { Step, StepProps } from '../Step'
import { StepWidget } from '../StepWidget'

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
}

class StepOne extends Step<Record<string, any>> {
  protected type = 'step-one' as StepType
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): Record<string, any> {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<Record<string, any>>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

class StepTwo extends Step<Record<string, any>> {
  protected type = 'step-two' as StepType
  protected stepName = 'stepTwo'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): Record<string, any> {
    return {}
  }

  protected defaultValues = { b: 'b' }
  renderStep(props: StepProps<Record<string, any>>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

const factory = new StepFactory()
factory.registerStep(new StepOne())
factory.registerStep(new StepTwo())

describe('StepWidget tests', () => {
  test(`shows different steps based on type`, () => {
    let { container } = render(<StepWidget type={'step-one' as StepType} factory={factory} initialValues={{}} />)
    expect(container).toMatchSnapshot()
    container = render(<StepWidget type={'step-two' as StepType} factory={factory} initialValues={{}} />).container
    expect(container).toMatchSnapshot()
  })

  test(`shows invalid step`, () => {
    const { container } = render(<StepWidget type={'step-three' as StepType} factory={factory} initialValues={{}} />)
    expect(container).toMatchSnapshot()
  })

  test(`shows step and merge initial values`, () => {
    const { container } = render(
      <StepWidget type={'step-one' as StepType} factory={factory} initialValues={{ a: 'b' }} />
    )
    expect(container).toMatchSnapshot()
  })

  test(`should call on submit of the form`, () => {
    const onSubmit = jest.fn()
    const { container } = render(
      <StepWidget type={'step-one' as StepType} onUpdate={onSubmit} factory={factory} initialValues={{ a: 'b' }} />
    )
    fireEvent.click(container.children[0])
    expect(onSubmit).toBeCalled()
  })
})
