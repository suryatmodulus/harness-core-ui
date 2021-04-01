import { useState } from 'react'
import { isNil } from 'lodash-es'
import { validateJSONWithSchema } from '@common/utils/YamlUtils'
import { useDeepCompareEffect } from '@common/hooks'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import { usePipelineSchema } from '../PipelineSchema/PipelineSchemaContext'

export function useValidationErrors(): { errorMap: Map<string, string[]> } {
  const { pipelineSchema } = usePipelineSchema()
  const {
    state: { pipeline: originalPipeline }
  } = usePipelineContext()

  const [errorMap, setErrorMap] = useState<Map<string, string[]>>(new Map())
  useDeepCompareEffect(() => {
    async function validateErrors(): Promise<void> {
      if (!isNil(pipelineSchema) && pipelineSchema.data) {
        const error = await validateJSONWithSchema({ pipeline: originalPipeline }, pipelineSchema.data)
        setErrorMap(error)
      }
    }
    validateErrors()
  }, [originalPipeline, pipelineSchema])

  return { errorMap }
}
