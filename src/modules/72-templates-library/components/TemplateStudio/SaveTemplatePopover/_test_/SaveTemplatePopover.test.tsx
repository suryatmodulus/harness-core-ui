import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, templatePathProps } from '@common/utils/routeUtils'
import templateContextMock from '@templates-library/components/TemplateStudio/SaveTemplatePopover/_test_/stateMock'
import { SaveTemplatePopover } from '../SaveTemplatePopover'

describe('<SaveTemplatePopover /> tests', () => {
  test('snapshot test', async () => {
    const { container } = render(
      <TemplateContext.Provider value={templateContextMock}>
        <TestWrapper>
          <SaveTemplatePopover />
        </TestWrapper>
      </TemplateContext.Provider>
    )
    expect(container).toMatchSnapshot()
  })
  test('should not show popover on click when creating a template', async () => {
    const { getByText } = render(
      <TemplateContext.Provider value={templateContextMock}>
        <TestWrapper
          path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })}
          pathParams={{
            templateIdentifier: DefaultNewTemplateId,
            accountId: 'accountId',
            orgIdentifier: 'orgIdentifier',
            projectIdentifier: 'projectIdentifier',
            module: 'cd',
            templateType: 'Step'
          }}
        >
          <SaveTemplatePopover />
        </TestWrapper>
      </TemplateContext.Provider>
    )

    const saveButton = getByText('save')
    expect(saveButton).toBeTruthy()
    await act(async () => {
      fireEvent.click(saveButton)
    })

    const popover = findPopoverContainer()
    expect(popover).not.toBeTruthy()
  })
  test('should show popover on click when editing a template', async () => {
    const { getByText } = render(
      <TemplateContext.Provider value={templateContextMock}>
        <TestWrapper
          path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })}
          pathParams={{
            templateIdentifier: 'templateIdentifier',
            accountId: 'accountId',
            orgIdentifier: 'orgIdentifier',
            projectIdentifier: 'projectIdentifier',
            module: 'cd',
            templateType: 'Step'
          }}
        >
          <SaveTemplatePopover />
        </TestWrapper>
      </TemplateContext.Provider>
    )

    const saveButton = getByText('save')
    expect(saveButton).toBeTruthy()
    await act(async () => {
      fireEvent.click(saveButton)
    })

    const popover = findPopoverContainer()
    expect(popover).toBeTruthy()
  })
})
