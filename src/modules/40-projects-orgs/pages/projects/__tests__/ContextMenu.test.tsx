import React from 'react'
import { fireEvent, render, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ContextMenu from '@projects-orgs/components/Menu/ContextMenu'
import routes from '@common/RouteDefinitions'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { projectWithModules } from './ProjectPageMock'

const reloadProjects = jest.fn()
const editProject = jest.fn()
const collaborators = jest.fn()
const setMenuOpen = jest.fn()
const openDialog = jest.fn()

const routeParams = {
  accountId: 'testAcc',
  orgIdentifier: projectWithModules.orgIdentifier || '',
  projectIdentifier: projectWithModules.identifier
}
describe('Context Menu test', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']
  let getByTestId: RenderResult['getByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <ContextMenu
          project={projectWithModules}
          reloadProjects={reloadProjects}
          editProject={editProject}
          collaborators={collaborators}
          setMenuOpen={setMenuOpen}
          openDialog={openDialog}
        />
      </TestWrapper>
    )
    container = renderObj.container
    getByText = renderObj.getByText
    getByTestId = renderObj.getByTestId
  })
  test('render', () => {
    expect(container).toMatchSnapshot()
  })
  test('invite collaborators ', async () => {
    fireEvent.click(getByText('Invite Collaborators'))
    expect(collaborators).toHaveBeenCalled()
  }),
    test('edit project ', async () => {
      fireEvent.click(getByText('Edit'))
      expect(editProject).toHaveBeenCalled()
    }),
    test('delete ', async () => {
      fireEvent.click(getByText('Delete'))
      expect(openDialog).toHaveBeenCalled()
    }),
    test('Go to CV ', async () => {
      fireEvent.click(getByText('Go to Continuous Verification'))
      expect(getByTestId('location').innerHTML.endsWith(routes.toCVProjectOverview(routeParams))).toBeTruthy()
    }),
    test('Go to CD ', async () => {
      fireEvent.click(getByText('Go to Continuous Delivery'))
      expect(getByTestId('location').innerHTML.endsWith(routes.toCDProjectOverview(routeParams))).toBeTruthy()
    }),
    test('Go to CE ', async () => {
      fireEvent.click(getByText('Go to Continuous Efficiency'))
      expect(getByTestId('location').innerHTML.endsWith(routes.toCECORules(routeParams))).toBeTruthy()
    }),
    test('Go to CI ', async () => {
      fireEvent.click(getByText('Go to Continuous Integration'))
      expect(getByTestId('location').innerHTML.endsWith(routes.toCIProjectOverview(routeParams))).toBeTruthy()
    }),
    test('Go to CF ', async () => {
      fireEvent.click(getByText('Go to Continuous Features'))
      expect(getByTestId('location').innerHTML.endsWith(routes.toCFFeatureFlags(routeParams))).toBeTruthy()
    })
})
