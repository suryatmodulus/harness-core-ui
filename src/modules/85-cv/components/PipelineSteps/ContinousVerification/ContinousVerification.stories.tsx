import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { Card, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StepWidgetProps } from '@pipeline/components/AbstractSteps/StepWidget'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { ContinousVerificationStep } from './ContinousVerificationStep'
factory.registerStep(new ContinousVerificationStep())

export default {
  title: 'Pipelines / Pipeline Steps / ContinousVerification step',
  // eslint-disable-next-line react/display-name
  component: TestStepWidget,
  argTypes: {
    type: { control: { disable: true } },
    stepViewType: {
      control: {
        type: 'inline-radio',
        options: Object.keys(StepViewType)
      }
    },
    onUpdate: { control: { disable: true } },
    initialValues: {
      control: {
        type: 'object'
      }
    }
  }
} as Meta

export const ContinousVerification: Story<Omit<StepWidgetProps, 'factory'>> = args => {
  const [value, setValue] = React.useState({})
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', columnGap: '20px' }}>
      <Card>
        <TestStepWidget {...args} onUpdate={setValue} />
      </Card>
      <Card>
        <pre>{yamlStringify(value)}</pre>
      </Card>
    </div>
  )
}

//TODO this will be changed after final implementation
ContinousVerification.args = {
  initialValues: { identifier: 'Test_A', type: StepType.Verify },
  type: StepType.Verify,
  stepViewType: StepViewType.InputSet,
  path: '',
  template: {
    identifier: 'Test_A',
    type: StepType.Verify,
    timeout: RUNTIME_INPUT_VALUE,
    spec: { skipDryRun: false, skipSteadyStateCheck: false }
  },
  allValues: {
    type: StepType.Verify,
    name: 'Test A',
    identifier: 'Test_A',
    timeout: RUNTIME_INPUT_VALUE,
    spec: { skipDryRun: false, skipSteadyStateCheck: false }
  }
}
