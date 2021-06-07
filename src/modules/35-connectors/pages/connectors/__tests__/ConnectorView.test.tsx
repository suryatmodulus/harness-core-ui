import { render, waitFor, queryByText, fireEvent } from '@testing-library/react'
import React from 'react'
import type { ConnectorResponse, Connector, ConnectorInfoDTO } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import * as mockSchemaData from './mocks/schema.json'
import ConnectorView from '../ConnectorView'
import { GitHttp } from './mockData'
import * as mockMetaData from './snippets.metadata.json'
import * as mockSnippetData from './snippet.json'
import * as mockSecretData from './mocks/secret.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useListSecretsV2: jest.fn().mockImplementation(() => {
    return { data: {} }
  }),
  useGetYamlSchema: jest.fn().mockImplementation(() => ({ refetch: jest.fn(), loading: false })),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('Connector Details Page', () => {
  const setup = (type = 'Git') =>
    render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ConnectorView
          type={type as ConnectorInfoDTO['type']}
          response={GitHttp.data.content as ConnectorResponse}
          updateConnector={(_data: Connector) => new Promise(resolve => resolve({}))}
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
      const switchToYAML = container.querySelector('[data-test="connectorViewYaml"]')
      expect(switchToYAML).toBeTruthy()
      fireEvent.click(switchToYAML!)
    })
    expect(getYamlBuilderContainer()).toBeTruthy()
  })

  test('Edit and save connector YAML', async () => {
    const { container } = setup()
    await waitFor(() => {
      const switchToYAML = container.querySelector('[data-test="connectorViewYaml"]')
      expect(switchToYAML).toBeTruthy()
      fireEvent.click(switchToYAML!)
      const editDetailsBtn = container?.querySelector('#editDetailsBtn')
      fireEvent.click(editDetailsBtn!)
    })
    expect(container).toMatchSnapshot()
  })
})
