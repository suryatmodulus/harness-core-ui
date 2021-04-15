import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { DefineYourMonitoringSource, DefineYourMonitoringSourceProps } from '../DefineYourMonitoringSource'

function WrapperComponent(props: Omit<DefineYourMonitoringSourceProps, 'formikProps'>): JSX.Element {
  return (
    <TestWrapper>
      <Formik onSubmit={() => undefined} initialValues={{}}>
        {formikProps => {
          return (
            <FormikForm>
              <DefineYourMonitoringSource {...props} formikProps={formikProps} />
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for DefineYourMonitoringSource', () => {
  test('Ensure card renders passed in props correctly', async () => {
    const { container } = render(
      <WrapperComponent
        iconLabel="New Relic"
        mainHeading="sdfsdfsd"
        subHeading="sdfsdf"
        sourceIcon={{ name: 'service-newrelic' }}
        stepLabelProps={{ stepNumber: 2, totalSteps: 3 }}
      />
    )
    await waitFor(() => expect(container.querySelector('[class*="defineMonitoringSource"]')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })

  test('Ensure that identifier is disabled oon edit', async () => {
    const { container } = render(
      <WrapperComponent
        iconLabel="New Relic"
        mainHeading="sdfsdfsd"
        subHeading="sdfsdf"
        sourceIcon={{ name: 'service-newrelic' }}
        stepLabelProps={{ stepNumber: 2, totalSteps: 3 }}
        isEdit={true}
      />
    )
    await waitFor(() => expect(container.querySelector('[class*="defineMonitoringSource"]')).not.toBeNull())
    expect(container.querySelector('[class*="txtIdContainer"] span[icon="edit"]')).toBeNull()
  })
})
