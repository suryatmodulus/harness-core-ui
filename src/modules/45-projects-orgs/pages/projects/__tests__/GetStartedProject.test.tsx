import React from 'react'
import { act, fireEvent, queryAllByText, render, waitFor } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { orgMockData } from '@projects-orgs/modals/ProjectModal/views/__tests__/OrgMockData'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import GetStartedProject from '../views/GetStartedProject/GetStartedProject'
import { createMockData, projectPageMock } from './ProjectPageMock'

const getProjectList = jest.fn()
const deleteProject = jest.fn()
const deleteProjectMock = (): Promise<{ status: string }> => {
  deleteProject()
  return Promise.resolve({ status: 'SUCCESS' })
}
jest.mock('services/cd-ng', () => ({
  useGetOrganizationList: jest.fn().mockImplementation(() => {
    return { ...orgMockData, refetch: jest.fn(), error: null }
  }),
  usePostProject: jest.fn().mockImplementation(() => createMockData),
  useGetProjectAggregateDTOList: jest.fn().mockImplementation(args => {
    getProjectList(args)
    return { ...projectPageMock, refetch: jest.fn(), error: null }
  }),
  useDeleteProject: jest.fn().mockImplementation(() => ({ mutate: deleteProjectMock })),
  useGetCurrentGenUsers: () => jest.fn(),
  useGetInvites: () => jest.fn(),
  useSendInvite: () => jest.fn(),
  useGetRoles: () => jest.fn(),
  useResendVerifyEmail: () => jest.fn()
}))

describe('Get Started Project test', () => {
  test('Add a new Project ', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStarted({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <GetStartedProject />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.click(getByText('projectLabel'))
      await waitFor(() => queryAllByText(document.body, 'projectsOrgs')[0])
    })
    let form = findDialogContainer()
    expect(form).toBeTruthy()

    fillAtForm([
      { container: form as HTMLElement, type: InputTypes.TEXTFIELD, fieldId: 'name', value: 'dummyname' },
      { container: form as HTMLElement, type: InputTypes.TEXTFIELD, fieldId: 'orgIdentifier', value: 'dummyorg' }
    ])
    await act(async () => {
      clickSubmit(form as HTMLElement)
    })
    await act(async () => {
      fireEvent.click(form?.querySelector('[icon="cross"]')!)
    })
    form = findDialogContainer()
    expect(form).not.toBeTruthy()
  })
})
