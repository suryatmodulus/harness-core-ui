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
    name: 'spec.account',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.imageName',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.tags',
    type: TransformValuesTypes.List
  },
  {
    name: 'spec.dockerfile',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.context',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.labels',
    type: TransformValuesTypes.Map
  },
  {
    name: 'spec.buildArgs',
    type: TransformValuesTypes.Map
  },
  {
    name: 'spec.target',
    type: TransformValuesTypes.Text
  },
  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // {
  //   name: 'spec.pull',
  //   type: TransformValuesTypes.Pull
  // },
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
    name: 'spec.account',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.accountLabel',
    isRequired: true
  },
  {
    name: 'spec.imageName',
    type: ValidationFieldTypes.Text,
    label: 'imageNameLabel',
    isRequired: true
  },
  {
    name: 'spec.tags',
    type: ValidationFieldTypes.List,
    isRequired: true
  },
  {
    name: 'spec.labels',
    type: ValidationFieldTypes.Map
  },
  {
    name: 'spec.buildArgs',
    type: ValidationFieldTypes.Map
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
    name: 'spec.account',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.accountLabel',
    isRequired: true
  },
  {
    name: 'spec.imageName',
    type: ValidationFieldTypes.Text,
    label: 'imageNameLabel',
    isRequired: true
  },
  {
    name: 'spec.tags',
    type: ValidationFieldTypes.List,
    isRequired: true
  },
  {
    name: 'spec.labels',
    type: ValidationFieldTypes.Map
  },
  {
    name: 'spec.buildArgs',
    type: ValidationFieldTypes.Map
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
