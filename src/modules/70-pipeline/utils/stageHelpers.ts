import { isEmpty } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import type { InputSetDTO } from '@pipeline/components/InputSetForm/InputSetForm'
import type { GraphLayoutNode, PipelineExecutionSummary } from 'services/pipeline-ng'
import type { StringKeys } from 'framework/strings'

export enum StageType {
  DEPLOY = 'Deployment',
  BUILD = 'CI',
  FEATURE = 'FeatureFlag',
  PIPELINE = 'Pipeline',
  APPROVAL = 'Approval',
  CUSTOM = 'Custom'
}

export const changeEmptyValuesToRunTimeInput = (inputset: any): InputSetDTO => {
  Object.keys(inputset).map(key => {
    if (typeof inputset[key] === 'object') {
      changeEmptyValuesToRunTimeInput(inputset[key])
    } else if (inputset[key] === '') {
      inputset[key] = '<+input>'
    }
  })
  return inputset
}

export function isCDStage(node?: GraphLayoutNode): boolean {
  return node?.nodeType === StageType.DEPLOY || node?.module === 'cd' || !isEmpty(node?.moduleInfo?.cd)
}

export function isCIStage(node?: GraphLayoutNode): boolean {
  return node?.nodeType === StageType.BUILD || node?.module === 'ci' || !isEmpty(node?.moduleInfo?.ci)
}

export function hasCDStage(pipelineExecution?: PipelineExecutionSummary): boolean {
  return pipelineExecution?.modules?.includes('cd') || !isEmpty(pipelineExecution?.moduleInfo?.cd)
}

export function hasCIStage(pipelineExecution?: PipelineExecutionSummary): boolean {
  return pipelineExecution?.modules?.includes('ci') || !isEmpty(pipelineExecution?.moduleInfo?.ci)
}

export const getHelpeTextForTags = (
  fields: {
    imagePath: string
    region?: string
    connectorRef: string
    registryHostname?: string
  },

  getString: (key: StringKeys) => string
): string => {
  const { connectorRef, region, imagePath, registryHostname } = fields
  const invalidFields = []
  if (!connectorRef || getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME) {
    invalidFields.push(getString('connector'))
  }
  if (region !== undefined && (!region || getMultiTypeFromValue(region) === MultiTypeInputType.RUNTIME)) {
    invalidFields.push(getString('regionLabel'))
  }
  if (
    registryHostname !== undefined &&
    (!registryHostname || getMultiTypeFromValue(registryHostname) === MultiTypeInputType.RUNTIME)
  ) {
    invalidFields.push(getString('connectors.GCR.registryHostname'))
  }
  if (!imagePath || getMultiTypeFromValue(imagePath) === MultiTypeInputType.RUNTIME) {
    invalidFields.push(getString('pipeline.imagePathLabel'))
  }

  const helpText = `${invalidFields.length > 1 ? invalidFields.join(', ') : invalidFields[0]} ${
    invalidFields.length > 1 ? ' are ' : ' is '
  } ${getString('pipeline.tagDependencyRequired')}`
  return invalidFields.length > 0 ? helpText : ''
}
