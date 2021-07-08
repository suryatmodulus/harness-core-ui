import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdng from 'services/cd-ng'
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
    repoIdentifier: 'some repo',
    branch: 'master'
  }
})

describe('GitPopover', () => {
  test('matches snapshot', () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper>
        <GitPopover {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
