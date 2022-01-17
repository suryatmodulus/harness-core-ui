/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, render } from '@testing-library/react'
import { set } from 'lodash-es'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, templatePathProps } from '@common/utils/routeUtils'
import type { TemplateSelectorLeftViewProps } from '@templates-library/components/TemplateSelector/TemplateSelectorLeftView/TemplateSelectorLeftView'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import type { TemplateDetailsProps } from '@templates-library/components/TemplateDetails/TemplateDetails'
import { TemplateSelector } from '../TemplateSelector'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn()
}))

jest.mock('@templates-library/components/TemplateSelector/TemplateSelectorLeftView/TemplateSelectorLeftView', () => ({
  ...(jest.requireActual(
    '@templates-library/components/TemplateSelector/TemplateSelectorLeftView/TemplateSelectorLeftView'
  ) as any),
  // eslint-disable-next-line react/display-name
  TemplateSelectorLeftView: ({ setTemplate }: TemplateSelectorLeftViewProps) => {
    React.useEffect(() => {
      setTemplate(mockTemplates.data?.content?.[0])
    }, [])
    return <div className="template-selector-left-view-mock"></div>
  }
}))

jest.mock('@templates-library/components/TemplateDetails/TemplateDetails', () => ({
  ...(jest.requireActual('@templates-library/components/TemplateDetails/TemplateDetails') as any),
  // eslint-disable-next-line react/display-name
  TemplateDetails: ({ template }: TemplateDetailsProps) => {
    // React.useEffect(() => {
    //   setTemplate(mockTemplates.data?.content?.[0])
    // }, [])
    return <div className="template-details-left-view-mock">{template.identifier}</div>
  }
}))

describe('<TemplateSelector /> tests', () => {
  test('snapshot test', async () => {
    const context = { ...pipelineContextMock }
    set(context, 'state.templateView.templateDrawerData.data.selectorData.onUseTemplate', jest.fn())
    set(context, 'state.templateView.templateDrawerData.data.selectorData.onCopyTemplate', jest.fn())
    set(context, 'state.templateView.templateDrawerData.data.selectorData.selectedTemplateRef', 'templateRef')
    const { container, getByRole } = render(
      <PipelineContext.Provider value={context}>
        <TestWrapper
          path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })}
          pathParams={{
            templateIdentifier: 'Test_Http_Template',
            accountId: 'accountId',
            orgIdentifier: 'default',
            projectIdentifier: 'Yogesh_Test',
            module: 'cd',
            templateType: 'Step'
          }}
        >
          <TemplateSelector />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    expect(container).toMatchSnapshot()
    const copyTemplateBtn = getByRole('button', { name: 'templatesLibrary.copyToPipeline' })
    await act(async () => {
      fireEvent.click(copyTemplateBtn)
    })
    const copyBtn = getByText(findDialogContainer() as HTMLElement, 'confirm')
    await act(async () => {
      fireEvent.click(copyBtn)
    })
    expect(context.state.templateView.templateDrawerData.data?.selectorData?.onUseTemplate).toBeCalled()

    const useTemplateBtn = getByRole('button', { name: 'templatesLibrary.useTemplate' })
    await act(async () => {
      fireEvent.click(useTemplateBtn)
    })
    const useBtn = getByText(findDialogContainer() as HTMLElement, 'confirm')
    await act(async () => {
      fireEvent.click(useBtn)
    })
    expect(context.state.templateView.templateDrawerData.data?.selectorData?.onUseTemplate).toBeCalled()
  })
})
