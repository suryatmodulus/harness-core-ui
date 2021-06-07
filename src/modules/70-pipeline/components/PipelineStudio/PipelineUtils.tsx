import React from 'react'
import type { ITreeNode } from '@blueprintjs/core'
import { Text, Color } from '@wings-software/uicore'
import get from 'lodash-es/get'
import type { UseStringsReturn } from 'framework/strings'

import type { NgPipeline, StageElement, StageElementWrapper } from 'services/cd-ng'

export enum PipelineStudioView {
  ui = 'ui',
  yaml = 'yaml'
}
export interface NodeClasses {
  primary?: string
  secondary?: string
  empty?: string
}

const getStageTree = (
  stage: StageElement,
  classes: NodeClasses = {},
  getString: UseStringsReturn['getString'],
  {
    hideNonRuntimeFields = false,
    template = {}
  }: { hideNonRuntimeFields?: boolean; template?: Record<string, never> } = {}
): ITreeNode => {
  const stageNode: ITreeNode = {
    id: `Stage.${stage.identifier}`,
    hasCaret: true,
    label: (
      <Text color={Color.GREY_800} style={{ fontWeight: 600 }} width="147" lineClamp={1}>
        {stage.name}
      </Text>
    ),
    className: classes.primary,
    childNodes: []
  }

  // common to ci and cd stage
  if (hideNonRuntimeFields) {
    const hasVariables = get(template, 'variables', null)
    hasVariables &&
      stageNode.childNodes?.push({
        id: `Stage.${stage.identifier}.Variables`,
        hasCaret: false,
        label: <Text>{getString('customVariables.title')}</Text>,
        className: classes.secondary
      })
  } else {
    stageNode.childNodes?.push({
      id: `Stage.${stage.identifier}.Variables`,
      hasCaret: false,
      label: <Text>{getString('customVariables.title')}</Text>,
      className: classes.secondary
    })
  }

  // only cd stage
  // TODO: Replace 'Deployment' literal with enum
  if (stage.type === 'Deployment') {
    const enabledChildList = Object.keys(get(template, 'spec.serviceConfig.serviceDefinition.spec', {}))
    const childNodes = []
    if (hideNonRuntimeFields) {
      enabledChildList.includes('artifacts') &&
        childNodes.push({
          id: `Stage.${stage.identifier}.Service.Artifacts`,
          hasCaret: false,
          label: <Text>{'Artifacts'}</Text>,
          className: classes.secondary
        })
      enabledChildList.includes('manifests') &&
        childNodes.push({
          id: `Stage.${stage.identifier}.Service.Manifests`,
          hasCaret: false,
          label: <Text>{'Manifests'}</Text>,
          className: classes.secondary
        })
      enabledChildList.includes('variables') &&
        childNodes.push({
          id: `Stage.${stage.identifier}.Service.Variables`,
          hasCaret: false,
          label: <Text>{'Variables'}</Text>,
          className: classes.secondary
        })
    } else {
      childNodes.push(
        ...[
          {
            id: `Stage.${stage.identifier}.Service.Artifacts`,
            hasCaret: false,
            label: <Text>{'Artifacts'}</Text>,
            className: classes.secondary
          },
          {
            id: `Stage.${stage.identifier}.Service.Manifests`,
            hasCaret: false,
            label: <Text>{'Manifests'}</Text>,
            className: classes.secondary
          },
          {
            id: `Stage.${stage.identifier}.Service.Variables`,
            hasCaret: false,
            label: <Text>{'Variables'}</Text>,
            className: classes.secondary
          }
        ]
      )
    }
    if (hideNonRuntimeFields) {
      Object.keys(get(template, 'spec', {})).includes('serviceConfig') &&
        stageNode.childNodes?.push({
          id: `Stage.${stage.identifier}.Service`,
          hasCaret: false,
          label: <Text>{getString('service')}</Text>,
          className: classes.secondary,
          isExpanded: true,
          childNodes
        })
    } else {
      stageNode.childNodes?.push({
        id: `Stage.${stage.identifier}.Service`,
        hasCaret: false,
        label: <Text>{getString('service')}</Text>,
        className: classes.secondary,
        isExpanded: true,
        childNodes
      })
    }
  }

  // only ci stage
  // TODO: Replace 'ci' literal with enum
  // TODO: hide as implementation is not done
  /*if (stage.type === 'CI') {
    stageNode.childNodes?.push({
      id: `Stage.${stage.identifier}.Dependencies`,
      hasCaret: false,
      label: <Text>{i18n.dependencies}</Text>,
      className: classes.secondary,
      isExpanded: false
    })
  }*/

  // common to ci and cd stage
  // TODO: temporary enable only for CD as Ci is not implemented
  if (stage.type === 'Deployment') {
    if (hideNonRuntimeFields) {
      const enabledChildList = Object.keys(get(template, 'spec', {}))
      enabledChildList.includes('infrastructure') &&
        stageNode.childNodes?.push({
          id: `Stage.${stage.identifier}.Infrastructure`,
          hasCaret: false,
          label: <Text>{getString('infrastructureText')}</Text>,
          className: classes.secondary
        })

      enabledChildList.includes('execution') &&
        stageNode.childNodes?.push({
          id: `Stage.${stage.identifier}.Execution`,
          hasCaret: false,
          label: <Text>{getString('executionText')}</Text>,
          className: classes.secondary
        })
    } else {
      stageNode.childNodes?.push(
        {
          id: `Stage.${stage.identifier}.Infrastructure`,
          hasCaret: false,
          label: <Text>{getString('infrastructureText')}</Text>,
          className: classes.secondary
        },
        {
          id: `Stage.${stage.identifier}.Execution`,
          hasCaret: false,
          label: <Text>{getString('executionText')}</Text>,
          className: classes.secondary
        }
      )
    }
  }
  return stageNode
}

export const getPipelineTree = (
  pipeline: NgPipeline,
  classes: NodeClasses = {},
  getString: UseStringsReturn['getString'],
  options: { hideNonRuntimeFields?: boolean; template?: { stages: [{ stage: Record<string, never> }] } } = {}
): ITreeNode[] => {
  const returnNodes: ITreeNode[] = [
    {
      id: 'Pipeline',
      hasCaret: false,
      label: (
        <Text color={Color.GREY_800} style={{ fontWeight: 500 }}>
          {getString('customVariables.pipelineVariablesTitle')}
        </Text>
      ),
      className: classes.primary
    }
  ]
  if (options.hideNonRuntimeFields) {
    get(options.template, 'variables', null) &&
      returnNodes.push({
        id: 'Pipeline.Variables',
        hasCaret: false,
        label: (
          <Text color={Color.GREY_800} style={{ fontWeight: 500 }}>
            {getString('customVariables.title')}
          </Text>
        ),
        className: classes.empty
      })
  } else {
    returnNodes.push({
      id: 'Pipeline.Variables',
      hasCaret: false,
      label: (
        <Text color={Color.GREY_800} style={{ fontWeight: 500 }}>
          {getString('customVariables.title')}
        </Text>
      ),
      className: classes.empty
    })
  }
  /* istanbul ignore else */ if (
    pipeline.stages &&
    pipeline.stages?.length > 0 &&
    (!options.template || options.template?.stages)
  ) {
    const stages: ITreeNode = {
      id: 'Stages',
      hasCaret: true,
      isExpanded: true,
      label: (
        <Text color={Color.GREY_500} font={{ size: 'normal' }} style={{ fontWeight: 500 }}>
          {getString('stages')}
        </Text>
      ),
      childNodes: []
    }
    pipeline.stages.forEach((data, index) => {
      if (data.parallel && data.parallel.length > 0) {
        data.parallel.forEach((nodeP: StageElementWrapper) => {
          nodeP.stage && stages.childNodes?.push(getStageTree(nodeP.stage, classes, getString))
        })
      } /* istanbul ignore else */ else if (
        data.stage &&
        (!options.template || options.template?.stages?.[index]?.stage)
      ) {
        stages.childNodes?.push(
          getStageTree(data.stage, classes, getString, {
            ...options,
            template: options.template?.stages?.[index]?.stage
          })
        )
      }
    })
    returnNodes.push(stages)
  }
  return returnNodes
}
