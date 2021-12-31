import React from 'react'
import { Color, Container } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'

export const DefaultNewStageName = 'Stage Name'
export const DefaultNewStageId = 'stage_name'

const StageTemplateForm = (_props: unknown, formikRef: TemplateFormRef) => {
  const {
    state: { isLoading, isUpdated }
  } = React.useContext(TemplateContext)
  const {
    state: {
      selectionState: { selectedStageId },
      templateTypes
    },
    contextType,
    setTemplateTypes,
    renderPipelineStage,
    getStageFromPipeline
  } = usePipelineContext()
  const [key, setKey] = React.useState<string>(uuid())
  const selectedStage = getStageFromPipeline(selectedStageId || '')

  React.useImperativeHandle(formikRef, () => ({
    resetForm() {
      setKey(uuid())
    },
    submitForm() {
      return noop
    },
    getErrors() {
      return noop
    }
  }))

  React.useEffect(() => {
    if (!isUpdated && !isLoading) {
      setKey(uuid())
    }
  }, [isLoading])

  return (
    <Container background={Color.FORM_BG} key={key} height={'100%'}>
      {renderPipelineStage({
        stageType: selectedStage?.stage?.stage?.type,
        minimal: false,
        contextType,
        templateTypes,
        setTemplateTypes,
        openTemplateSelector: noop,
        closeTemplateSelector: noop
      })}
    </Container>
  )
}

export const StageTemplateFormWithRef = React.forwardRef(StageTemplateForm)
