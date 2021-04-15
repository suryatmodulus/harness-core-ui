import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'

export const transformValuesFieldsConfig = [
  {
    name: 'identifier',
    type: TransformValuesTypes.Text
  },
  {
    name: 'name',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.connectorRef',
    type: TransformValuesTypes.ConnectorRef
  },
  {
    name: 'spec.region',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.bucket',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.key',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.sourcePaths',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.endpoint',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.archiveFormat',
    type: TransformValuesTypes.ArchiveFormat
  },
  {
    name: 'spec.override',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.pathStyle',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.limitMemory',
    type: TransformValuesTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: TransformValuesTypes.LimitCPU
  },
  {
    name: 'timeout',
    type: TransformValuesTypes.Text
  }
]

export const editViewValidateFieldsConfig = [
  {
    name: 'identifier',
    type: ValidationFieldTypes.Identifier,
    label: 'identifier',
    isRequired: true
  },
  {
    name: 'name',
    type: ValidationFieldTypes.Name,
    label: 'pipelineSteps.stepNameLabel',
    isRequired: true
  },
  {
    name: 'spec.connectorRef',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.awsConnectorLabel',
    isRequired: true
  },
  {
    name: 'spec.region',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.regionLabel',
    isRequired: true
  },
  {
    name: 'spec.bucket',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.bucketLabel',
    isRequired: true
  },
  {
    name: 'spec.key',
    type: ValidationFieldTypes.Text,
    label: 'keyLabel',
    isRequired: true
  },
  {
    name: 'spec.sourcePaths',
    type: ValidationFieldTypes.List,
    label: 'pipelineSteps.sourcePathsLabel',
    isRequired: true
  },
  {
    name: 'spec.limitMemory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: ValidationFieldTypes.LimitCPU
  },
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout
  }
]

export const inputSetViewValidateFieldsConfig = [
  {
    name: 'spec.connectorRef',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.awsConnectorLabel',
    isRequired: true
  },
  {
    name: 'spec.region',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.regionLabel',
    isRequired: true
  },
  {
    name: 'spec.bucket',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.bucketLabel',
    isRequired: true
  },
  {
    name: 'spec.key',
    type: ValidationFieldTypes.Text,
    label: 'keyLabel',
    isRequired: true
  },
  {
    name: 'spec.sourcePaths',
    type: ValidationFieldTypes.List,
    label: 'pipelineSteps.sourcePathsLabel',
    isRequired: true
  },
  {
    name: 'spec.resources.limits.memory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.resources.limits.cpu',
    type: ValidationFieldTypes.LimitCPU
  },
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout
  }
]
