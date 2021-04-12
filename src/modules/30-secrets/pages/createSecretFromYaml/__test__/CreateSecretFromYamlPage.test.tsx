import React, { useEffect } from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import * as mockSchemaData from '@common/services/mocks/schema.json'
import CreateSecretFromYamlPage from '../CreateSecretFromYamlPage'
import mockData from '../../secretDetails/__test__/secretDetailsMocks.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ bind }: YamlBuilderProps) => {
  useEffect(() => {
    bind?.({
      getLatestYaml: () => 'name: test',
      getYAMLValidationErrorMap: () => new Map()
    })
  }, [])

  return 'dummy'
})
jest.mock('services/cd-ng', () => ({
  usePostSecretViaYaml: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetYamlSchema: jest.fn().mockImplementation(() => {
    return { ...mockData.yamlSchema, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetYamlSnippetMetadata: jest.fn().mockImplementation(() => {
    return { ...mockData.yamlSnippetMetaData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetYamlSnippet: jest.fn().mockImplementation(() => {
    return { ...mockData.yamlSnippetMetaData, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('CreateSecretFromYamlPage', () => {
  test('render', () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/create-secret-from-yaml" pathParams={{ accountId: 'dummy' }}>
        <CreateSecretFromYamlPage mockSchemaData={mockSchemaData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(getByText('createSecretYAML.create'))
    })
  })
})
