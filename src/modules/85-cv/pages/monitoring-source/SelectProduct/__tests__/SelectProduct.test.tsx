import React from 'react'
import { render, waitFor, queryByText, fireEvent } from '@testing-library/react'
import { noop } from 'lodash-es'
import { Classes } from '@blueprintjs/core'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { SelectProduct } from '../SelectProduct'

const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as object),
  useHistory: () => ({
    push: mockHistoryPush
  })
}))

describe('SelectProduct', () => {
  test('Render for AppD monitoring source', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVProjectOverview({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <SelectProduct type="AppDynamics" onCompleteStep={() => noop} />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'Monitoring Source'))
    expect(getByText('AppDynamics')).toBeDefined()
    expect(getByText('cv.monitoringSources.appD.createConnectorText')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('Render google cloud operations monitoring source', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVProjectOverview({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <SelectProduct
          type="GoogleCloudOperations"
          onCompleteStep={() => noop}
          productSelectValidationText="Product is required."
        />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'Monitoring Source')).not.toBeNull())
    fireEvent.click(getByText('cv.monitoringSources.gco.createConnectorText'))
    await waitFor(() => expect(document.body.querySelector('[class*="StepWizard"]')).not.toBeNull())

    const closeModalButton = document.querySelector('svg[data-icon="cross"]')
    if (!closeModalButton) {
      throw Error('modal close button did not render')
    }
    fireEvent.click(closeModalButton)
    await waitFor(() => expect(document.body.querySelector('[class*="StepWizard"]')).toBeNull())

    fireEvent.click(getByText('Next'))
    await waitFor(() => expect(container.querySelectorAll(`[class*="${Classes.FORM_HELPER_TEXT}"]`).length).toBe(2))
    getByText('cv.onboarding.selectProductScreen.validationText.connectorRef')
    getByText('Product is required.')
  })

  test('Ensure that when user clicks previous, it takes them back to monitoring source page', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVProjectOverview({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <SelectProduct
          type="GoogleCloudOperations"
          onCompleteStep={() => noop}
          productSelectValidationText="Product is required."
        />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'Monitoring Source')).not.toBeNull())
    fireEvent.click(getByText('Previous'))

    await waitFor(() =>
      expect(mockHistoryPush).toHaveBeenCalledWith(
        '/account/1234_account/cv/orgs/1234_ORG/projects/1234_project/admin/setup?step=2'
      )
    )
  })
})
