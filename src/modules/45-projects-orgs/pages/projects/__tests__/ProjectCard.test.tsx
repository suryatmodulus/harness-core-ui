import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import type { ProjectAggregateDTO } from 'services/cd-ng'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { accountPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { responseProjectAggregateDTO, responseProjectAggregateDTOWithNoModules } from './ProjectPageMock'

describe('Project Card test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toProjects({ ...accountPathProps })}
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
          path={routes.toProjects({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <ProjectCard data={responseProjectAggregateDTOWithNoModules.data as ProjectAggregateDTO} isPreview={true} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
})
