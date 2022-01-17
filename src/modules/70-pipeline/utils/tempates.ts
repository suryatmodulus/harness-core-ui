import type * as yup from 'yup'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { PipelineContextType } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { UseStringsReturn } from 'framework/strings'

export function getNameAndIdentifierSchema(
  getString: UseStringsReturn['getString'],
  contextType?: string
): { [key: string]: yup.Schema<string | undefined> } {
  return contextType === PipelineContextType.Pipeline
    ? {
        name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.build.create.stageNameRequiredError') }),
        identifier: IdentifierSchema()
      }
    : {}
}
