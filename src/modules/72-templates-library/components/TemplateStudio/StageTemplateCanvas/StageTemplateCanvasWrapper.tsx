import produce from 'immer'
import { get, isEmpty, isUndefined, omit, omitBy, set } from 'lodash-es'
import React from 'react'
import { useParams } from 'react-router-dom'
import {
  DefaultNewStageId,
  DefaultNewStageName
} from '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateForm/StageTemplateForm'
import { TemplatePipelineProvider } from '@pipeline/components/TemplatePipelineContext'
import { StageTemplateCanvasWithRef } from '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateCanvas'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { DefaultPipeline } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { sanitize } from '@common/utils/JSONUtils'

const StageTemplateCanvasWrapper = (_props: unknown, formikRef: TemplateFormRef) => {
  const {
    state: { template, isLoading, isUpdated },
    updateTemplate,
    isReadonly
  } = React.useContext(TemplateContext)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const createPipelineFromTemplate = React.useCallback(
    () =>
      produce({ ...DefaultPipeline }, draft => {
        if (!isEmpty(template.spec)) {
          set(draft, 'stages[0].stage', { ...template.spec, name: DefaultNewStageName, identifier: DefaultNewStageId })
        }
      }),
    [template.spec]
  )

  const [pipeline, setPipeline] = React.useState<PipelineInfoConfig>(createPipelineFromTemplate())

  React.useEffect(() => {
    if (!isLoading && !isUpdated) {
      setPipeline(createPipelineFromTemplate())
    }
  }, [isLoading, isUpdated])

  const onUpdatePipeline = async (pipelineConfig: PipelineInfoConfig) => {
    const stage = omitBy(omitBy(get(pipelineConfig, 'stages[0].stage'), isUndefined), isEmpty)
    const processNode = omit(stage, 'name', 'identifier', 'description', 'tags')
    sanitize(processNode, { removeEmptyArray: false, removeEmptyObject: false, removeEmptyString: false })
    set(template, 'spec', processNode)
    await updateTemplate(template)
  }

  if (pipeline) {
    return (
      <TemplatePipelineProvider
        queryParams={{ accountIdentifier: accountId, orgIdentifier, projectIdentifier }}
        initialValue={pipeline as PipelineInfoConfig}
        onUpdatePipeline={onUpdatePipeline}
        isReadOnly={isReadonly}
      >
        <StageTemplateCanvasWithRef ref={formikRef} />
      </TemplatePipelineProvider>
    )
  } else {
    return <></>
  }
}

export const StageTemplateCanvasWrapperWithRef = React.forwardRef(StageTemplateCanvasWrapper)
