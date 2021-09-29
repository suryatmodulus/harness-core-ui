import React from 'react'
import { render, screen, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SelectFlagGitRepoPage from '../SelectFlagGitRepoPage'

jest.mock('services/cd-ng', () => ({
  useGetSourceCodeManagers: jest.fn(() => ({})),
  useListGitSync: jest.fn(() => ({ refetch: jest.fn() }))
}))

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SelectFlagGitRepoPage gitRepoRefetch={jest.fn()} />
    </TestWrapper>
  )
}
describe('SelectFeatureFlagGitRepoPage', () => {
  test('it should render component', async () => {
    const { container } = renderComponent()
    expect(container).toMatchSnapshot()
  })

  test('it should render buttons correctly', async () => {
    renderComponent()

    expect(screen.getByText('cf.selectFlagRepo.useExistingRepo')).toBeInTheDocument()
    expect(screen.getByText('cf.selectFlagRepo.newRepo')).toBeInTheDocument()
  })
})
