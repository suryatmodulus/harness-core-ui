import React from 'react'
import { Icon, Text } from '@wings-software/uicore'

import css from './RepositoryInfo.module.scss'

export interface RepositoryInfoProps {
  repoName?: string
}

export function RepositoryInfo(props: RepositoryInfoProps): React.ReactElement {
  return (
    <div className={css.main}>
      <Icon name="repository" size={12} />
      <Text>{props.repoName}</Text>
    </div>
  )
}
