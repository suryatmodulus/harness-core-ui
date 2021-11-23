import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateDetailsDrawer } from '../TemplateDetailDrawer'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

describe('<TemplateDetailDrawer /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <TemplateDetailsDrawer
          accountId="account-id"
          onClose={jest.fn()}
          templateIdentifier={'templateIdentifier'}
          versionLabel={'versionLabel'}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
