import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdng from 'services/cd-ng'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import GitPopover, { GitPopoverProps } from '../GitPopover'

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.spyOn(cdng, 'useGetListOfBranchesWithStatus').mockImplementation((): any => {
  return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
})
jest.spyOn(cdng, 'useListGitSync').mockImplementation((): any => {
  return { data: gitConfigs, refetch: getListGitSync, loading: false }
})
jest.spyOn(cdng, 'useGetSourceCodeManagers').mockImplementation((): any => {
  return { data: sourceCodeManagers, refetch: jest.fn(), loading: false }
})

const getProps = (): GitPopoverProps => ({
  data: {
    repoIdentifier: 'identifier',
    branch: 'master'
  }
})

describe('GitPopover', () => {
  test('should return popover icon and content', () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper>
        <GitSyncStoreProvider>
          <GitPopover {...props} />
        </GitSyncStoreProvider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should return null when repoIdentifier is not passed in props', () => {
    const { container } = render(
      <TestWrapper>
        <GitPopover data={{ branch: 'master' }} />
      </TestWrapper>
    )

    expect(container).toMatchInlineSnapshot(`<div />`)
  })
})
