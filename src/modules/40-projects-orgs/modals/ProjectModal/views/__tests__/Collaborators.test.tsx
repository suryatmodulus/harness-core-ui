import React from 'react'

import { fireEvent, getByText, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import type {
  Project,
  ResponseOptionalListRoleDTO,
  ResponsePageInviteDTO,
  ResponsePageUserSearchDTO
} from 'services/cd-ng'
import { findPopoverContainer, TestWrapper, UseGetMockData } from '@common/utils/testUtils'
import { rolesMockData } from './RolesMockData'
import { userMockData } from './UserMockData'
import Collaborators from '../Collaborators'
import { invitesMockData } from './InvitesMockData'

const project: Project = {
  orgIdentifier: 'testOrg',
  identifier: 'test',
  name: 'test',
  color: '#e6b800',
  modules: ['CD'],
  description: 'test',
  tags: { tag1: '', tag2: 'tag3' }
}

describe('Collaborators test', () => {
  test('Render Collaborators ', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
        <Collaborators
          projectIdentifier={project.identifier}
          orgIdentifier={project.orgIdentifier}
          userMockData={userMockData as UseGetMockData<ResponsePageUserSearchDTO>}
          rolesMockData={rolesMockData as UseGetMockData<ResponseOptionalListRoleDTO>}
          invitesMockData={invitesMockData as UseGetMockData<ResponsePageInviteDTO>}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const role = getByText(container, 'Project Member')
    fireEvent.click(role!)
    const popover = findPopoverContainer()
    const opt = getByText(popover as HTMLElement, 'Project Viewer')
    fireEvent.click(opt!)
    await act(async () => {
      fireEvent.change(container.querySelector("input[name='collaborators']")!, {
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
