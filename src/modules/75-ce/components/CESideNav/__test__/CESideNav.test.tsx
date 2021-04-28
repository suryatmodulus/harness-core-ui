import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CESideNav from '../CESideNav'

const testpath = 'account/:accountId/ce/home'
const testpathAS = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules/'
const testpathAP = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/access-points/'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

describe('side nav tests', () => {
  test('side nav renders without error when no project is selected', () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <CESideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('side nav renders without error when on AutoStopping Rules tab', () => {
    const { container } = render(
      <TestWrapper path={testpathAS} pathParams={testparams}>
        <CESideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('side nav renders without error when on Access Point tab', () => {
    const { container } = render(
      <TestWrapper path={testpathAP} pathParams={testparams}>
        <CESideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
