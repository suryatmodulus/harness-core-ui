/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, render } from '@testing-library/react'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { TemplateBar } from '../TemplateBar'

jest.mock('@pipeline/utils/useStageTemplateActions', () => ({
  useStageTemplateActions: jest.fn().mockReturnValue({
    onUseTemplate: jest.fn(),
    onCopyTemplate: jest.fn(),
    onRemoveTemplate: jest.fn(),
    onOpenTemplateSelector: jest.fn()
  })
}))

jest.mock('services/template-ng', () => ({
  useGetTemplate: jest.fn().mockImplementation(() => ({
    status: 'SUCCESS',
    data: {
      data: {
        name: 'New Stage Name',
        identifier: 'new_stage_name',
        versionLabel: 'v1'
      }
    }
  }))
}))

describe('<TemplateBar /> tests', () => {
  test('should match snapshot and work as expected', async () => {
    const props = {
      templateLinkConfig: {
        templateRef: 'New_CD_Stage_Name',
        versionLabel: 'Version1'
      },
      onOpenTemplateSelector: jest.fn(),
      onRemoveTemplate: jest.fn()
    }
    const { container } = render(
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
        <TemplateBar {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const optionsBtn = container.querySelector('.bp3-icon-more') as HTMLElement
    await act(async () => {
      fireEvent.click(optionsBtn)
    })
    const popover = findPopoverContainer()
    const changeBtn = getByText(popover as HTMLElement, 'pipeline.changeTemplateLabel')
    await act(async () => {
      fireEvent.click(changeBtn)
    })
    expect(props.onOpenTemplateSelector).toBeCalled()
    const removeBtn = getByText(popover as HTMLElement, 'pipeline.removeTemplateLabel')
    await act(async () => {
      fireEvent.click(removeBtn)
    })
    const submitBtn = getByText(findDialogContainer() as HTMLElement, 'common.remove')
    await act(async () => {
      fireEvent.click(submitBtn)
    })
    expect(props.onRemoveTemplate).toBeCalled()
  })
})
