import React from 'react'
import { IconName, Icon, Layout, Text } from '@wings-software/uicore'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { StagesMap } from '../../PipelineContext/PipelineContext'

interface StageListProps {
  stages: StageElementWrapper[]
  selectedStageId?: string
  stagesMap: StagesMap
  onClick?: (stageId: string, type: StageType) => void
}

export const StageList: React.FC<StageListProps> = ({ stages, selectedStageId, onClick, stagesMap }): JSX.Element => {
  const list: Array<{ name: string; icon: IconName; identifier: string; type: string }> = []
  stages.forEach((node: StageElementWrapper) => {
    const type = stagesMap[node.stage?.type || '']

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
