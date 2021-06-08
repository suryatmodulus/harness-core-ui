import React from 'react'

import { fireEvent, getByText, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import type { Project } from 'services/cd-ng'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import Collaborators from '../Collaborators'
import { userMockData } from './UserMockData'
import { invitesMockData, roleMockData } from './InvitesMockData'

const project: Project = {
  orgIdentifier: 'testOrg',
  identifier: 'test',
  name: 'test',
  color: '#e6b800',
  modules: ['CD'],
  description: 'test',
  tags: { tag1: '', tag2: 'tag3' }
}

const response = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

jest.mock('@common/hooks/useFeatureFlag', () => ({
  useFeatureFlags: () => ({ NG_RBAC_ENABLED: true })
}))

jest.mock('services/cd-ng', () => ({
  useGetCurrentGenUsers: jest
    .fn()
    .mockImplementation(() => ({ data: userMockData, loading: false, refetch: jest.fn() })),
  useGetInvites: jest.fn().mockImplementation(() => ({ data: invitesMockData, loading: false, refetch: jest.fn() })),
  useSendInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useDeleteInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) })),
  useUpdateInvite: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(response) }))
}))

jest.mock('services/rbac', () => ({
  useGetRoleList: jest.fn().mockImplementation(() => ({ data: roleMockData, loading: false, refetch: jest.fn() }))
}))

describe('Collaborators test', () => {
  test('Render Collaborators ', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
        <Collaborators projectIdentifier={project.identifier} orgIdentifier={project.orgIdentifier} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const role = getByText(container, 'common.projectViewer')
    fireEvent.click(role!)
    const popover = findPopoverContainer()
    const opt = getByText(popover as HTMLElement, 'Project Admin')
    fireEvent.click(opt!)
    await act(async () => {
      fireEvent.change(container.querySelector("input[name='projectsOrgs.collaborator']")!, {
        target: { value: 'example5@email.com' }
      })
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    await act(async () => {
      const refresh = container.querySelectorAll('[icon="refresh"]')[0]
      fireEvent.click(refresh)
    })
    await act(async () => {
      const deleteInvite = container.querySelectorAll('[height="20"]')[0]
      fireEvent.click(deleteInvite)
    })
  })
})
