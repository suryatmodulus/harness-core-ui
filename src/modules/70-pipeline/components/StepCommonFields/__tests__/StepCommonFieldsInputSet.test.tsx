import React from 'react'
import { getByPlaceholderText, render } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import StepCommonFieldsInputSet from '../StepCommonFieldsInputSet'

interface TestProps {
  template?: any
  readonly?: boolean
}

const TestComponent = ({ template, readonly }: TestProps): React.ReactElement => (
  <TestWrapper>
    {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
    <Formik initialValues={{}} onSubmit={() => {}}>
      <FormikForm>
        <StepCommonFieldsInputSet template={template} readonly={!!readonly} />
      </FormikForm>
    </Formik>
  </TestWrapper>
)

const template = {
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    resources: {
      limits: {
        memory: RUNTIME_INPUT_VALUE,
        cpu: RUNTIME_INPUT_VALUE
      }
    }
  }
}

describe('<StepCommonFieldsInputSet /> tests', () => {
  test('Should render properly', () => {
    const { container } = render(<TestComponent template={template} />)
    expect(container).toMatchSnapshot()
  })
  test('Readonly mode works', () => {
    const { container } = render(<TestComponent template={template} readonly />)
    expect(
      (getByPlaceholderText(container, 'pipelineSteps.limitMemoryPlaceholder') as HTMLInputElement).disabled
    ).toBeTruthy()
    expect(
      (getByPlaceholderText(container, 'pipelineSteps.limitCPUPlaceholder') as HTMLInputElement).disabled
    ).toBeTruthy()
    expect(
      (getByPlaceholderText(container, 'pipelineSteps.timeoutPlaceholder') as HTMLInputElement).disabled
    ).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
