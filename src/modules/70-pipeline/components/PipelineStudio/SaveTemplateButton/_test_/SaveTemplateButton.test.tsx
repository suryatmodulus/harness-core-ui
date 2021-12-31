import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import { stepTemplateMock } from '@pipeline/utils/__tests__/useSaveTemplate.test'
import { SaveTemplateButton } from '../SaveTemplateButton'

jest.mock('@pipeline/utils/useTemplateSelector', () => ({
  useTemplateSelector: jest.fn().mockReturnValue({
    openTemplateSelector: jest.fn(),
    closeTemplateSelector: jest.fn()
  })
}))

describe('<TemplatesButtons /> tests', () => {
  test('should match snapshot and work as expected', async () => {
    const { container, getByText } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper
          path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
          pathParams={{
            pipelineIdentifier: 'stage1',
            accountId: 'accountId',
            orgIdentifier: 'CV',
            projectIdentifier: 'Milos2',
            module: 'cd'
          }}
        >
          <SaveTemplateButton
            data={{ ...stepTemplateMock.spec, name: 'name', identifier: 'identifier' }}
            type={'Stage'}
          />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    expect(container).toMatchSnapshot()

    const saveAsTemplateBtn = getByText('common.saveAsTemplate')
    await act(async () => {
      fireEvent.click(saveAsTemplateBtn)
    })
    const dialog = findDialogContainer()
    expect(dialog).toBeDefined()
  })
})
