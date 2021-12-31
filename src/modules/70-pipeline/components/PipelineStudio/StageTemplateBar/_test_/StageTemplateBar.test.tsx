import React from 'react'
import { act, fireEvent, getByText, render } from '@testing-library/react'
import produce from 'immer'
import { set } from 'lodash-es'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import { useStageTemplateActions } from '@pipeline/utils/useStageTemplateActions'
import { StageTemplateBar } from '../StageTemplateBar'

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

describe('<StageTemplateBar /> tests', () => {
  test('should match snapshot and work as expected', async () => {
    const context = produce(pipelineContextMock, draft => {
      delete draft.state.pipeline.stages
      set(draft, 'state.pipeline.stages[0].stage', {
        name: 'Stage1',
        identifier: 'Stage1',
        template: {
          templateRef: 'New_CD_Stage_Name',
          versionLabel: 'Version1'
        }
      })
    })

    const { container } = render(
      <PipelineContext.Provider
        value={
          {
            ...context,
            getStageFromPipeline: jest.fn(() => {
              return { stage: context.state.pipeline.stages?.[0], parent: undefined }
            }),
            updatePipeline: jest.fn
          } as any
        }
      >
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
          <StageTemplateBar />
        </TestWrapper>
      </PipelineContext.Provider>
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
    expect(useStageTemplateActions().onOpenTemplateSelector).toBeCalled()
    const removeBtn = getByText(popover as HTMLElement, 'pipeline.removeTemplateLabel')
    await act(async () => {
      fireEvent.click(removeBtn)
    })
    const submitBtn = getByText(findDialogContainer() as HTMLElement, 'common.remove')
    await act(async () => {
      fireEvent.click(submitBtn)
    })
    expect(useStageTemplateActions().onRemoveTemplate).toBeCalled()
  })
})
