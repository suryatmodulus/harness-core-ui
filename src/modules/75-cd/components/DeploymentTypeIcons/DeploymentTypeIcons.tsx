import React from 'react'
import { Icon, Layout, Text } from '@wings-software/uicore'
import type { IconName } from '@blueprintjs/core'

const getIconName = (deploymentType: string): string => {
  switch (deploymentType.toLowerCase()) {
    case 'kubernetes':
      return 'app-kubernetes'
    default:
      return 'question'
  }
}

export interface DeploymentTypeIconsProps {
  deploymentTypes: string[]
  limit?: number
  size?: number
}

export const DeploymentTypeIcons: React.FC<DeploymentTypeIconsProps> = props => {
  const { deploymentTypes, size = 18, limit = 2 } = props
  return (
    <Layout.Horizontal>
      {deploymentTypes.slice(0, limit).map(deploymentType => {
        return (
          <Icon
            key={deploymentType}
            name={getIconName(deploymentType) as IconName}
            size={size}
            padding={{ left: 'xsmall', right: 'xsmall' }}
          />
        )
      })}
      {deploymentTypes.length > limit ? <Text>{`+ ${deploymentTypes.length - limit}`}</Text> : <></>}
    </Layout.Horizontal>
  )
}
