import React from 'react'
import { render } from '@testing-library/react'
import { Formik, FormikForm, MultiTypeInputType } from '@wings-software/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import StepCommonFields from '../StepCommonFields'

interface TestProps {
  initialValues?: any
}

const TestComponent = ({ initialValues }: TestProps): React.ReactElement => (
  <TestWrapper>
    {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
    <Formik initialValues={initialValues} onSubmit={() => {}} formName="stepCommonFieldsForm">
      <FormikForm>
        <StepCommonFields
          allowableTypes={[MultiTypeInputType.EXPRESSION]}
          buildInfrastructureType={'KubernetesDirect'}
        />
      </FormikForm>
    </Formik>
  </TestWrapper>
)

describe('<StepCommonFields /> tests', () => {
  test('Should render properly with no data', () => {
    const { container } = render(<TestComponent />)
    expect(container).toMatchSnapshot()
  })
  test('Should render properly with passed initial values', () => {
    const { container } = render(
      <TestComponent
        initialValues={{
          spec: {
            limitMemory: '128Mi',
            limitCPU: '0.1',
            timeout: '120s'
          }
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
