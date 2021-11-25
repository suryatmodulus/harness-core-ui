import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { useLocation } from 'react-router-dom'
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

function ComponentWrapper(): React.ReactElement {
  const location = useLocation()
  return (
    <React.Fragment>
      <TemplateDetails
        accountId={'kmpySmUISimoRrJL6NL73w'}
        templateIdentifier={'manjutesttemplate'}
        versionLabel={'v4'}
      />
      <div data-testid="location">{`${location.pathname}${location.search}`}</div>
    </React.Fragment>
  )
}

describe('<TemplateDetails /> tests', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockReturnValue(mockTemplatesSuccessResponse)
  })
  test('snapshot test', async () => {
    const { container } = render(
      <TestWrapper>
        <ComponentWrapper />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should open template studio on clicking open in template studio', async () => {
    const { getByRole, getByTestId } = render(
      <TestWrapper>
        <ComponentWrapper />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'templatesLibrary.openInTemplateStudio' }))
    })
    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/kmpySmUISimoRrJL6NL73w/settings/resources/template-studio/Step/template/manjutesttemplate/?versionLabel=v4
      </div>
    `)
  })
})
