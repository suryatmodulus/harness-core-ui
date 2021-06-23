import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, connectorPathProps, projectPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import EntityUsage from '../EntityUsage'
import referencedData from './entity-usage-data.json'
import referencedDataWithGit from './entity-usage-data-with-git.json'

describe('Entity Usage', () => {
  test('render for no data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <EntityUsage
          mockData={{
            data: {} as any,
            loading: false
          }}
          entityIdentifier="secretId"
          entityType="Secrets"
        />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'entityReference.noRecordFound'))
    expect(container).toMatchSnapshot()
  })
  test('render for data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <EntityUsage
          mockData={{
            data: referencedData as any,
            loading: false
          }}
          entityIdentifier="secretId"
          entityType="Secrets"
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render for connector data with gitSync', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toConnectorDetails({ ...projectPathProps, ...connectorPathProps })}
        pathParams={{
          accountId: 'dummy',
          projectIdentifier: 'projectIdentifier',
          orgIdentifier: 'orgIdentifier',
          connectorId: 'connectorId'
        }}
        queryParams={{ repoIdentifier: 'firstRepo', branch: 'master' }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <EntityUsage
          mockData={{
            data: referencedDataWithGit as any,
            loading: false
          }}
          entityIdentifier="connectorId"
          entityType="Connectors"
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
