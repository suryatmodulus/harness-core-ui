import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { Card, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import {
  factory,
  TestStepWidget,
  TestStepWidgetProps
} from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { DeployServiceStep } from './DeployServiceStep'

factory.registerStep(new DeployServiceStep())

export default {
  title: 'Pipelines / Pipeline Steps / DeployServiceStep',
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

export const DeployService: Story<Omit<TestStepWidgetProps, 'factory'>> = args => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [value, setValue] = React.useState({ ...(args.initialValues as any) })
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', columnGap: '20px' }}>
      <Card>
        <TestStepWidget {...args} initialValues={value} onUpdate={setValue} />
      </Card>
      <Card>
        <pre>{yamlStringify(value)}</pre>
      </Card>
    </div>
  )
}
DeployService.args = {
  initialValues: {},
  testWrapperProps: {
    path: '/account/:accountId/org/:orgIdentifier/project/:projectIdentifier',
    pathParams: { accountId: 'zEaak-FLS425IEO7OLzMUg', orgIdentifier: 'default', projectIdentifier: 'Max_Test' }
  },
  type: StepType.DeployService,
  stepViewType: StepViewType.Edit,
  path: '',
  template: {
    serviceRef: RUNTIME_INPUT_VALUE
  },
  allValues: {
    serviceRef: RUNTIME_INPUT_VALUE
  }
}
