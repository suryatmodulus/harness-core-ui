import { render, waitFor, queryByText, fireEvent, getByText } from '@testing-library/react'
import { act } from 'react-test-renderer'
import React from 'react'
import type { ConnectorResponse, ConnectorInfoDTO } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import { gitConfigs, sourceCodeManagers, branchStatusMock } from '@connectors/mocks/mock'
import * as mockSchemaData from './mocks/schema.json'
import ConnectorView from '../ConnectorView'
import { GitHttp, connectorWithGitData } from './mockData'
import * as mockMetaData from './snippets.metadata.json'
import * as mockSnippetData from './snippet.json'

import * as mockSecretData from './mocks/secret.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const updateConnector = jest.fn()
const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
jest.mock('services/cd-ng', () => ({
  useListSecretsV2: jest.fn().mockImplementation(() => {
    return { data: {} }
  }),
  useGetYamlSchema: jest.fn().mockImplementation(() => ({ refetch: jest.fn(), loading: false })),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, loading: false }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn(), loading: false }
  }),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return {
      data: branchStatusMock,
      refetch: getListOfBranchesWithStatus
    }
  })
}))

describe('Connector Details Page', () => {
  const setup = (type = 'Git') =>
    render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ConnectorView
          type={type as ConnectorInfoDTO['type']}
          response={GitHttp.data.content as ConnectorResponse}
          refetchConnector={() => new Promise(resolve => resolve(GitHttp.data.content as ConnectorResponse))}
          mockMetaData={mockMetaData as any}
          mockSnippetData={mockSnippetData as any}
          mockSchemaData={mockSchemaData as any}
          mockSecretData={mockSecretData as any}
        ></ConnectorView>
      </TestWrapper>
    )

  test('Rendering connector details', async () => {
    const { container } = setup()
    await waitFor(() => queryByText(container, 'Connectivity Status'))
    expect(container).toMatchSnapshot('view text')
  })
  test('Rendering connector details with K8sCluster', async () => {
    const { container } = setup('K8sCluster')
    await waitFor(() => queryByText(container, 'Connectivity Status'))
    expect(container).toMatchSnapshot('K8sCluster')
  })
  test('Rendering connector details with DockerRegistry', async () => {
    const { container } = setup('DockerRegistry')
    await waitFor(() => queryByText(container, 'Connectivity Status'))
    expect(container).toMatchSnapshot('DockerRegistry')
  })
  test('Edit details test', async () => {
    const { container } = setup()
    await waitFor(() => {
      const editDetailsBtn = container?.querySelector('#editDetailsBtn')
      fireEvent.click(editDetailsBtn!)
    })
    expect(container).toMatchSnapshot()
  })

  test('should verify switching to yaml and display yaml builder', async () => {
    const { container } = setup()
    const getYamlBuilderContainer = () => container.querySelector('[data-test="yamlBuilderContainer"]')
    expect(getYamlBuilderContainer()).toBeFalsy()
    await waitFor(() => {
      const switchToYAML = container.querySelector('[data-name="yaml-btn"]')
      expect(switchToYAML).toBeTruthy()
      fireEvent.click(switchToYAML!)
    })
    expect(getYamlBuilderContainer()).toBeTruthy()
  })

  test('Edit and save connector YAML', async () => {
    const { container } = setup()
    await waitFor(() => {
      const switchToYAML = container.querySelector('[data-name="yaml-btn"]')
      expect(switchToYAML).toBeTruthy()
      fireEvent.click(switchToYAML!)
      const editDetailsBtn = container?.querySelector('#editDetailsBtn')
      fireEvent.click(editDetailsBtn!)
    })
    expect(container).toMatchSnapshot()
  })

  test('Edit and save connector via YAML for a git-sync enabled project', async () => {
    const { container } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/resources/connectors"
        pathParams={{ accountId: 'dummy', projectIdentifier: 'projectIdentifier', orgIdentifier: 'orgIdentifier' }}
        queryParams={{ repoIdentifier: 'firstRepo', branch: 'master' }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <ConnectorView
          type={'DockerRegistry'}
          response={connectorWithGitData as ConnectorResponse}
          refetchConnector={() => new Promise(resolve => resolve(connectorWithGitData as ConnectorResponse))}
          mockMetaData={mockMetaData as any}
          mockSnippetData={mockSnippetData as any}
          mockSchemaData={mockSchemaData as any}
          mockSecretData={mockSecretData as any}
        ></ConnectorView>
      </GitSyncTestWrapper>
    )
    await waitFor(() => {
      const switchToYAML = container.querySelector('[data-name="yaml-btn"]')
      expect(switchToYAML).toBeTruthy()
      fireEvent.click(switchToYAML!)
      const editDetailsBtn = container?.querySelector('#editDetailsBtn')
      fireEvent.click(editDetailsBtn!)
    })
    await act(async () => {
      const saveYamlBtn = container?.querySelector('#saveYAMLChanges')
      fireEvent.click(saveYamlBtn!)
    })
    const modals = document.body.querySelectorAll('[class*="bp3-dialog"]')
    const saveToGitModal = modals[modals.length - 1] as HTMLElement
    expect(saveToGitModal).toBeTruthy()
    const saveToGitBtn = getByText(saveToGitModal, 'save')
    fireEvent.click(saveToGitBtn)
    expect(saveToGitModal).toMatchSnapshot()
  })
})
