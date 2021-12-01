import React from 'react'
import { render } from '@testing-library/react'
import { TemplateInputs } from '@templates-library/components/TemplateInputs/TemplateInputs'
import { mockTemplates, mockTemplatesInputYaml } from '@templates-library/TemplatesTestHelper'
import { TestWrapper } from '@common/utils/testUtils'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('services/template-ng', () => ({
  ...(jest.requireActual('services/template-ng') as any),
  useGetTemplateInputSetYaml: jest
    .fn()
    .mockImplementation(() => ({ data: mockTemplatesInputYaml, refetch: jest.fn(), error: null, loading: false }))
}))

describe('<TemplateInputs /> tests', () => {
  test('snapshot test', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateInputs template={mockTemplates?.data?.content?.[0] || {}} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
