import React from 'react'
import { fireEvent, getByText, render, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import DelegateSelectorPanel from '../DelegateSelectorPanel'

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  }),
  useGetDelegateSelectors: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))

const params = {
  accountId: 'testAcc'
}
const TEST_PATH = routes.toDelegates({
  ...accountPathProps
})

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  return (
    <TestWrapper path={TEST_PATH} pathParams={params}>
      <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={jest.fn()}>
        {formikProps => {
          return (
            <FormikForm>
              <DelegateSelectorPanel formikProps={formikProps} isReadonly={false} />
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

describe('<DelegateSelectorPanel /> test', () => {
  test('snapshot testing', () => {
    const { container } = render(
      <WrapperComponent initialValues={{ delegateSelectors: ['harness-sample-k8s-delegate'] }} />
    )
    expect(container).toMatchSnapshot()
  })

  test('should be able to select multiple tags from delegate selector', () => {
    const { container } = render(
      <WrapperComponent initialValues={{ delegateSelectors: ['harness-sample-k8s-delegate'] }} />
    )
    const selectedTag = getByText(container, 'harness-sample-k8s-delegate')
    expect(selectedTag).not.toBeNull()
    const inputBox = container.getElementsByClassName('bp3-multi-select-tag-input-input')[0]
    fireEvent.change(inputBox, { target: { value: 'new-tag' } })
    const overlay = container.getElementsByClassName('bp3-transition-container')[0]
    expect(overlay).not.toBeUndefined()
    const option = getByText(container, 'Create "new-tag"')
    expect(container).toMatchSnapshot()
    waitFor(() => fireEvent.click(option))
  })
})
