import React from 'react'
import { fireEvent, getByText, queryByText, render, RenderResult, waitFor } from '@testing-library/react'

import { act } from 'react-dom/test-utils'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'

import ProjectListView from '@projects-orgs/pages/projects/views/ProjectListView/ProjectListView'
import routes from '@common/RouteDefinitions'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { projectPageMock } from './ProjectPageMock'

jest.mock('react-timeago', () => () => 'dummy date')

const openProjectModal = jest.fn()
const closeModal = jest.fn()
const collaboratorModal = jest.fn()
const deleteProject = jest.fn()
const deleteProjectMock = (): Promise<{ status: string }> => {
  deleteProject()
  return Promise.resolve({ status: 'SUCCESS' })
}

jest.mock('@projects-orgs/modals/ProjectModal/useProjectModal', () => ({
  useProjectModal: () => ({ openProjectModal: openProjectModal, closeProjectModal: closeModal })
}))

jest.mock('@projects-orgs/modals/ProjectModal/useCollaboratorModal', () => ({
  useCollaboratorModal: () => ({ openCollaboratorModal: collaboratorModal, closeCollaboratorModal: closeModal })
}))

const showEditProject = jest.fn().mockImplementation(project => openProjectModal(project))
const collaborators = jest.fn(project => collaboratorModal(project))
jest.mock('services/cd-ng', () => ({
  useDeleteProject: jest.fn().mockImplementation(() => ({ mutate: deleteProjectMock })),
  useGetProjectAggregateDTOList: jest.fn().mockImplementation(() => {
    return { ...projectPageMock, refetch: jest.fn(), error: null }
  })
}))

const project = projectPageMock.data.data.content[0].projectResponse.project

describe('Project List', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']
  let getByTestId: RenderResult['getByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <ProjectListView
          data={projectPageMock.data as any}
          showEditProject={showEditProject}
          collaborators={collaborators}
          reloadPage={jest.fn()}
          gotoPage={jest.fn()}
        />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    getByTestId = renderObj.getByTestId
    await waitFor(() => getAllByText('projectLabel'))
  })
  test('render', async () => {
    expect(container).toMatchSnapshot()
  })
  test('click on Edit Project', async () => {
    const menu = container.querySelector(`[data-testid="menu-${project.identifier + project.orgIdentifier}"]`)
    fireEvent.click(menu!)
    const editMenu = getAllByText('edit')[0]
    expect(editMenu).toBeDefined()
    await act(async () => {
      fireEvent.click(editMenu!)
    })
    expect(showEditProject).toBeCalled()
  }),
    test('click on Collaborators', async () => {
      collaboratorModal.mockReset()
      const menu = container.querySelector(`[data-testid="menu-${project.identifier + project.orgIdentifier}"]`)
      fireEvent.click(menu!)
      const colMenu = getAllByText('projectContextMenuRenderer.invite')[0]
      expect(colMenu).toBeDefined()
      await act(async () => {
        fireEvent.click(colMenu!)
      })
      expect(collaboratorModal).toBeCalled()
    }),
    test('Delete', async () => {
      deleteProject.mockReset()
      const menu = container.querySelector(`[data-testid="menu-${project.identifier + project.orgIdentifier}"]`)
      fireEvent.click(menu!)
      const delMenu = getAllByText('delete')[0]
      expect(delMenu).toBeDefined()
      await act(async () => {
        fireEvent.click(delMenu!)
        await waitFor(() => getByText(document.body, 'projectCard.confirmDeleteTitle'))
        const form = findDialogContainer()
        expect(form).toBeTruthy()
        const deleteBtn = queryByText(form as HTMLElement, 'delete')
        fireEvent.click(deleteBtn!)
        expect(deleteProject).toBeCalled()
      })
    }),
    test('Click row', async () => {
      const row = container.getElementsByClassName('row card clickable')[0]
      await fireEvent.click(row!)
      await waitFor(() => getByTestId('location'))
      expect(
        getByTestId('location').innerHTML.endsWith(
          routes.toProjectDetails({
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            accountId: 'testAcc'
          })
        )
      ).toBeTruthy()
    })
})
