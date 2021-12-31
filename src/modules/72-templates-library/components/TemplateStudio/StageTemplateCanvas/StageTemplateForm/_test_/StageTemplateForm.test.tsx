import React from 'react'
import { render } from '@testing-library/react'
import { noop, set } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, templatePathProps } from '@common/utils/routeUtils'
import { stageTemplateMock } from '@templates-library/components/TemplateStudio/SaveTemplatePopover/_test_/stateMock'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import { DefaultNewStageId, DefaultNewStageName, StageTemplateFormWithRef } from '../StageTemplateForm'

describe('<StageTemplateFormWithRef /> tests', () => {
  test('snapshot test', async () => {
    const context = { ...pipelineContextMock }
    context.contextType = 'Template'
    delete context.state.pipeline.stages
    set(context, 'state.pipeline.stages[0].stage', {
      ...stageTemplateMock.spec,
      name: DefaultNewStageName,
      identifier: DefaultNewStageId
    })
    const { container } = render(
      <PipelineContext.Provider value={context}>
        <TestWrapper
          path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })}
          pathParams={{
            templateIdentifier: 'new_stage_name',
            accountId: 'accountId',
            orgIdentifier: 'default',
            projectIdentifier: 'Yogesh_Test',
            module: 'cd',
            templateType: 'Stage'
          }}
        >
          <StageTemplateFormWithRef />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    expect(container).toMatchSnapshot()
    expect(context.renderPipelineStage).toBeCalledWith({
      stageType: 'Deployment',
      minimal: false,
      contextType: 'Template',
      templateTypes: context.state.templateTypes,
      setTemplateTypes: context.setTemplateTypes,
      openTemplateSelector: noop,
      closeTemplateSelector: noop
    })
  })
})
