import React from 'react'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { fireEvent } from '@testing-library/dom'
import { TestWrapper } from '@common/utils/testUtils'
import { useMutateAsGet } from '@common/hooks'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { mockTemplatesSuccessResponse } from '@templates-library/TemplatesTestHelper'
import TemplatesPage from '@templates-library/pages/TemplatesPage/TemplatesPage'

jest.mock('@blueprintjs/core', () => ({
  ...(jest.requireActual('@blueprintjs/core') as any),
  // eslint-disable-next-line react/display-name
  Drawer: ({ children, title }: any) => (
    <div className="drawer-mock">
      {title}
      {children}
    </div>
  )
}))

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

describe('<TemplatesPage /> tests', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockReturnValue(mockTemplatesSuccessResponse)
  })
  test('snapshot test in grid view', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('snapshot test in list view after toggle', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesPage />
      </TestWrapper>
    )
    const listViewBtn = container.querySelector('[data-testid="list-view"]')
    expect(listViewBtn).toBeTruthy()
    await act(async () => {
      fireEvent.click(listViewBtn!)
    })
    expect(container).toMatchSnapshot()
  })
  test('should open template drawer when clicked on template card', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplatesPage />
      </TestWrapper>
    )

    const templateCards = container.querySelectorAll('.bp3-card.templateCard')
    expect(templateCards).toHaveLength(1)
    await act(async () => {
      fireEvent.click(templateCards[0])
    })
    const drawer = document.querySelector('.drawer-mock')
    expect(drawer).toBeTruthy()
    expect(drawer!.querySelector('[data-template-id="manjutesttemplate"]')).toBeTruthy()
  })
})
