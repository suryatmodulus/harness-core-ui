import React from 'react'
import { fireEvent, getByRole, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { projectPathProps, accountPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import CIDashboardPage from '../CIDashboardPage'

jest.mock('framework/exports', () => ({
  ...(jest.requireActual('framework/exports') as any),
  useRouteParams: () => ({
    params: {
      projectIdentifier: 'test'
    }
  })
}))

const pathParams = {
  accountId: 'TEST_ACCOUNT_ID',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'TEST_PROJECT',
  pipelineIdentifier: '-1',
  module: 'ci'
}

const TEST_PATH = routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })

describe('CIDashboardPage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
        <CIDashboardPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should navigate to pipeline studio on click of Create a pipeline Button', async () => {
    const { container, getByTestId } = render(
      <TestWrapper defaultAppStoreValues={defaultAppStoreValues} pathParams={pathParams} path={TEST_PATH}>
        <CIDashboardPage />
      </TestWrapper>
    )
    const createPipelineBtn = getByRole(container, 'button')
    fireEvent.click(createPipelineBtn)
    await waitFor(() => getByTestId?.('location'))
    expect(getByTestId?.('location').innerHTML.endsWith(routes.toPipelineStudio(pathParams as any))).toBeTruthy()
  })
})
