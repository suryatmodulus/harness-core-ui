import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'

export const transformValuesFieldsConfig = [
  {
    name: 'provisioner',
    type: TransformValuesTypes.Provisioner
  },
  {
    name: 'provisionerEnabled',
    type: TransformValuesTypes.Boolean
  },
  {
    name: 'provisionerSnippetLoading',
    type: TransformValuesTypes.Boolean
  }
]

export const editViewValidateFieldsConfig = []

export const inputSetViewValidateFieldsConfig = []
