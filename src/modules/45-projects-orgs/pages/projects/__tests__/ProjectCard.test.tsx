import React from 'react'
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import routes from '@common/RouteDefinitions'
import type { ProjectAggregateDTO } from 'services/cd-ng'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { responseProjectAggregateDTO, responseProjectAggregateDTOWithNoModules } from './ProjectPageMock'

const routeParams = {
  accountId: 'testAcc',
  orgIdentifier: responseProjectAggregateDTO.data?.projectResponse.project.orgIdentifier || '',
  projectIdentifier: responseProjectAggregateDTO.data?.projectResponse.project.identifier || ''
}

describe('Project Card test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <ProjectCard data={responseProjectAggregateDTO.data as ProjectAggregateDTO} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  }),
    test('Preview is ok', async () => {
      const { container } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <ProjectCard data={responseProjectAggregateDTOWithNoModules.data as ProjectAggregateDTO} isPreview={true} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
})

describe('Project Card Functionality Test', () => {
  let container: HTMLElement
  let queryByText: RenderResult['queryByText']
  let getByTestId: RenderResult['getByTestId']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <ProjectCard data={responseProjectAggregateDTO.data as ProjectAggregateDTO} />
      </TestWrapper>
    )
    container = renderObj.container
    queryByText = renderObj.queryByText
    getByTestId = renderObj.getByTestId
  })
  test('Click on CD', async () => {
    expect(container).toMatchSnapshot()
    const cdrow = queryByText('projectsOrgs.gotoDeployments')
    fireEvent.click(cdrow!)
    await waitFor(() => getByTestId('location'))
    expect(
      getByTestId('location').innerHTML.endsWith(routes.toDeployments({ ...routeParams, module: 'cd' }))
    ).toBeTruthy()
  }),
    test('Click on CV', async () => {
      const cvrow = queryByText('changeVerificationText')
      fireEvent.click(cvrow!)
      await waitFor(() => getByTestId('location'))
      expect(getByTestId('location').innerHTML.endsWith(routes.toCVProjectOverview(routeParams))).toBeTruthy()
    }),
    test('Click on CI', async () => {
      const cirow = queryByText('projectsOrgs.gotoBuilds')
      fireEvent.click(cirow!)
      await waitFor(() => getByTestId('location'))
      expect(
        getByTestId('location').innerHTML.endsWith(routes.toDeployments({ ...routeParams, module: 'ci' }))
      ).toBeTruthy()
    }),
    test('Click on CE', async () => {
      const cfrow = queryByText('projectsOrgs.gotoCloudCosts')
      fireEvent.click(cfrow!)
      expect(container).toMatchSnapshot()
    }),
    test('Click on CF', async () => {
      const cfrow = queryByText('projectsOrgs.gotoFeatureFlags')
      fireEvent.click(cfrow!)
      await waitFor(() => getByTestId('location'))
      expect(getByTestId('location').innerHTML.endsWith(routes.toCFFeatureFlags(routeParams))).toBeTruthy()
    })
})
