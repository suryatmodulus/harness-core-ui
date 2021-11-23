import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useMutateAsGet } from '@common/hooks'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { mockTemplatesSuccessResponse } from '@templates-library/TemplatesTestHelper'
import { TemplateDetails } from '../TemplateDetails'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn()
}))

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor', () => MonacoEditor)

describe('<TemplateDetails /> tests', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockReturnValue(mockTemplatesSuccessResponse)
  })
  test('snapshot test', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateDetails accountId={'accountId'} templateIdentifier={'templateIdentifier'} versionLabel={'v4'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
