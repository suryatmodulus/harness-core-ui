import React from 'react'
import { render } from '@testing-library/react'
import { set } from 'lodash-es'
import produce from 'immer'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import { TestWrapper } from '@common/utils/testUtils'
import {
  DefaultNewStageId,
  DefaultNewStageName
} from '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateForm/StageTemplateForm'
import { TemplateStageSpecifications } from '@templates-library/components/TemplateStageSpecifications/TemplateStageSpecifications'
import { stageMockTemplatesInputYaml } from '@templates-library/TemplatesTestHelper'

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null
}))

jest.mock('framework/strings', () => ({
  ...(jest.requireActual('framework/strings') as any),
  useStrings: jest.fn().mockReturnValue({
    getString: jest.fn().mockImplementation(val => val)
  })
}))

jest.mock('services/template-ng', () => ({
  ...(jest.requireActual('services/template-ng') as any),
  useGetTemplateInputSetYaml: jest
    .fn()
    .mockImplementation(() => ({ data: stageMockTemplatesInputYaml, refetch: jest.fn(), error: null, loading: false })),
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

jest.mock('services/cd-ng', () => ({
  useGetServiceAccessList: jest.fn().mockImplementation(() => ({
    loading: false,
    data: {
      status: 'SUCCESS',
      data: []
    },
    refetch: jest.fn()
  }))
}))

describe('<TemplateStageSpecifications /> tests', () => {
  test('snapshot test', async () => {
    const templateStage = {
      name: DefaultNewStageName,
      identifier: DefaultNewStageId,
      template: {
        templateRef: 'new_stage_name',
        versionLabel: 'v1',
        templateInputs: {
          type: 'Deployment',
          spec: {
            serviceConfig: {
              serviceRef: '<+input>'
            },
            infrastructure: {
              infrastructureDefinition: {
                type: 'KubernetesDirect',
                spec: {
                  namespace: '<+input>'
                }
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    identifier: 'Step_1',
                    type: 'ShellScript',
                    spec: {
                      source: {
                        type: 'Inline',
                        spec: {
                          script: '<+input>'
                        }
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
    const context = produce(pipelineContextMock, draft => {
      delete draft.state.pipeline.stages
      set(draft, 'state.pipeline.stages[0].stage', templateStage)
      set(draft, 'state.selectionState', {
        selectedStageId: templateStage.identifier
      })
      draft.getStageFromPipeline = jest.fn().mockReturnValue({
        stage: {
          stage: templateStage
        }
      })
    })
    const { container } = render(
      <PipelineContext.Provider value={context}>
        <TestWrapper
          path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
          pathParams={{
            pipelineIdentifier: 'stage1',
            accountId: 'accountId',
            projectIdentifier: 'Milos2',
            orgIdentifier: 'CV',
            module: 'cd'
          }}
        >
          <TemplateStageSpecifications />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    expect(container).toMatchSnapshot()
  })
})
