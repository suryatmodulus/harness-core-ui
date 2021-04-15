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
    name: 'description',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.connectorRef',
    type: TransformValuesTypes.ConnectorRef
  },
  {
    name: 'spec.image',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.args',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.buildTool',
    type: TransformValuesTypes.BuildTool
  },
  {
    name: 'spec.language',
    type: TransformValuesTypes.Language
  },
  {
    name: 'spec.packages',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.runOnlySelectedTests',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.testAnnotations',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.preCommand',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.postCommand',
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.reportPaths',
    type: TransformValuesTypes.ReportPaths
  },
  {
    name: 'spec.envVariables',
    type: TransformValuesTypes.Map
  },
  {
    name: 'spec.outputVariables',
    type: TransformValuesTypes.List
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
    label: 'pipelineSteps.connectorLabel',
    isRequired: true
  },
  {
    name: 'spec.image',
    type: ValidationFieldTypes.Text,
    label: 'imageLabel',
    isRequired: true
  },
  {
    name: 'spec.args',
    type: ValidationFieldTypes.Text,
    label: 'argsLabel',
    isRequired: true
  },
  {
    name: 'spec.packages',
    type: ValidationFieldTypes.Text,
    label: 'packagesLabel',
    isRequired: true
  },
  {
    name: 'spec.reportPaths',
    type: ValidationFieldTypes.List
  },
  {
    name: 'spec.envVariables',
    type: ValidationFieldTypes.Map
  },
  {
    name: 'spec.outputVariables',
    type: ValidationFieldTypes.OutputVariables
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
    label: 'pipelineSteps.connectorLabel',
    isRequired: true
  },
  {
    name: 'spec.image',
    type: ValidationFieldTypes.Text,
    label: 'imageLabel',
    isRequired: true
  },
  {
    name: 'spec.args',
    type: ValidationFieldTypes.Text,
    label: 'argsLabel',
    isRequired: true
  },
  {
    name: 'spec.packages',
    type: ValidationFieldTypes.Text,
    label: 'packagesLabel',
    isRequired: true
  },
  {
    name: 'spec.reports.spec.paths',
    type: ValidationFieldTypes.List
  },
  {
    name: 'spec.envVariables',
    type: ValidationFieldTypes.Map
  },
  {
    name: 'spec.outputVariables',
    type: ValidationFieldTypes.OutputVariables
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
