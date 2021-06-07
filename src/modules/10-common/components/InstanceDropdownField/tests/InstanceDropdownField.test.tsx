import React from 'react'
import { render } from '@testing-library/react'
import { Formik, Form } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import { InstanceDropdownField, InstanceTypes, FormInstanceDropdown } from '../InstanceDropdownField'

const props = {
  label: 'Instance',
  name: 'instances',
  expressions: [],
  value: { type: InstanceTypes.Instances, spec: { count: 10 } },
  onChange: jest.fn()
}

describe('Unit tests for InstanceDropdownField Component', () => {
  test('render the component', () => {
    const { container } = render(
      <TestWrapper>
        <InstanceDropdownField {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render the Formik component', () => {
    const onSubmit = jest.fn()
    const initialValues = {
      instanceType: ''
    }
    const { container } = render(
      <TestWrapper>
        <Formik onSubmit={onSubmit} initialValues={initialValues}>
          <Form>
            <FormInstanceDropdown {...props} />
          </Form>
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
