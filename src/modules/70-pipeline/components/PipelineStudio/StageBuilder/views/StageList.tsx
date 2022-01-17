/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, Icon, Layout, Text } from '@wings-software/uicore'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { getStageType } from '@pipeline/utils/templateUtils'
import type { StagesMap } from '../../PipelineContext/PipelineContext'

interface StageListProps {
  stages: StageElementWrapper[]
  templateTypes: { [key: string]: string }
  selectedStageId?: string
  stagesMap: StagesMap
  onClick?: (stageId: string, type: StageType) => void
}

export const StageList: React.FC<StageListProps> = ({
  stages,
  templateTypes,
  selectedStageId,
  onClick,
  stagesMap
}): JSX.Element => {
  const list: Array<{ name: string; icon: IconName; identifier: string; type: string }> = []
  stages.forEach((node: StageElementWrapper) => {
    const type = stagesMap[getStageType(node.stage, templateTypes)]

    if (node.stage?.identifier === selectedStageId) {
      list.unshift({
        name: node.stage?.name || '',
        identifier: node.stage?.identifier || '',
        icon: type.icon,
        type: node.stage?.type || ''
      })
    } else {
      list.push({
        name: node.stage?.name || '',
        identifier: node.stage?.identifier || '',
        icon: type.icon,
        type: node.stage?.type || ''
      })
    }
  })
  return (
    <>
      {list.map(node => (
        <Layout.Horizontal
          style={{ cursor: 'pointer' }}
          spacing="small"
          padding="small"
          key={node.identifier}
          onClick={e => {
            e.stopPropagation()
            onClick?.(node.identifier, node.type as StageType)
          }}
        >
          <Icon name={node.icon} />
          <Text lineClamp={1} width={200}>
            {node.name}
          </Text>
        </Layout.Horizontal>
      ))}
    </>
  )
}
