import React from 'react'
import { IconName, Text, Icon, Layout } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import type { GitSyncEntityListDTO, GitSyncEntityDTO } from 'services/cd-ng'
import { Entities } from '@common/interfaces/GitSyncInterface'

export enum Products {
  CD = 'CD',
  CI = 'CI',
  CORE = 'CORE'
}

export const getEntityIconName = (entityType: string | undefined): IconName => {
  switch (entityType) {
    case Entities.PROJECTS:
      return 'nav-project-selected'
    case Entities.PIPELINES:
      return 'pipeline-ng'
    case Entities.CONNECTORS:
      return 'resources-icon'
    case Entities.SECRETS:
      return 'secret-manager'
    default:
      return 'placeholder'
  }
}

export const RenderEntity: Renderer<CellProps<GitSyncEntityDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal>
      <Icon inline name={getEntityIconName(data.entityType)}></Icon>
      <Text padding={{ left: 'small' }} inline font={{ weight: 'bold' }} lineClamp={1}>
        {data.entityName}
      </Text>
    </Layout.Horizontal>
  )
}

export const RenderYamlPath: Renderer<CellProps<GitSyncEntityDTO>> = ({ row }) => {
  const data = row.original

  return (
    <>
      <Text inline lineClamp={1}>
        {data.entityGitPath}
      </Text>
    </>
  )
}

export const getEntityHeaderText = (data: GitSyncEntityListDTO): string => {
  return `${data.entityType?.toUpperCase()} ( ${data.count} )`
}

export const getTableColumns = (): Column<GitSyncEntityDTO>[] => {
  return [
    {
      Header: 'NAME',
      accessor: 'entityName',
      width: '25%',
      Cell: RenderEntity,
      disableSortBy: false
    },
    {
      Header: 'PATH',
      accessor: 'entityGitPath',
      width: '75%',
      Cell: RenderYamlPath,
      disableSortBy: false
    }
  ]
}
