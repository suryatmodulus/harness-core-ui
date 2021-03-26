import React from 'react'
import { Container, Icon, IconName, Text } from '@wings-software/uicore'
import copy from 'clipboard-copy'
import type { CellProps, Renderer, Column } from 'react-table'
import type { GitSyncEntityListDTO, GitSyncEntityDTO, GitSyncProductDTO } from 'services/cd-ng'
import { useToaster } from '@common/components/Toaster/useToaster'
import i18n from './GitSyncEntityTab.i18n'

export enum Products {
  CD = 'CD',
  CI = 'CI',
  CORE = 'CORE'
}

export enum Entity {
  PROJECTS = 'projects',
  PIPELINES = 'pipelines',
  CONNECTORS = 'connectors'
}

export enum repoProvider {
  GITHUB = 'github',
  GITLAB = 'gitlab',
  BITBUCKET = 'bitbucket',
  UNKNOWN = 'unknown'
}

interface SupportedProductsInterface {
  id: GitSyncProductDTO['moduleType']
  title: string
}

export const supportedProducts: SupportedProductsInterface[] = [
  { id: Products.CD, title: i18n.heading.cd },
  { id: Products.CI, title: i18n.heading.ci },
  { id: Products.CORE, title: i18n.heading.core }
]

export const getEntityIconName = (entityType: string): IconName => {
  switch (entityType) {
    case Entity.PROJECTS:
      return 'nav-project-selected'
    case Entity.PIPELINES:
      return 'pipeline-ng'
    case Entity.CONNECTORS:
      return 'resources-icon'
    default:
      return 'placeholder'
  }
}

export const getRepoProviderIconName = (repoProviderName: string): IconName => {
  switch (repoProviderName) {
    case repoProvider.GITHUB:
      return 'github'
    case repoProvider.GITLAB:
      return 'service-gotlab'
    case repoProvider.BITBUCKET:
      return 'bitbucket'
    case repoProvider.UNKNOWN:
    default:
      return 'service-github'
  }
}

export const RenderEntity: Renderer<CellProps<GitSyncEntityDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Container padding={{ left: 'small' }}>
      <Icon name={getEntityIconName(data.entityType || '')} margin={{ right: 'small' }} size={20} />
      <Text inline font={{ weight: 'bold' }} lineClamp={1}>
        {data.entityName}
      </Text>
      <Text margin={{ left: 'xxlarge', top: 'small' }} lineClamp={1}>
        {data.entityIdentifier}
      </Text>
    </Container>
  )
}
export const RenderRootfolder: Renderer<CellProps<GitSyncEntityDTO>> = ({ row }) => {
  const data = row.original
  return (
    <>
      <Icon name={getRepoProviderIconName(data.repoProviderType || '')} margin={{ right: 'small' }} size={20} />
      <Text inline padding={{ right: 'small' }} lineClamp={1}>
        {data.repositoryName}
      </Text>
      <Text inline padding={{ right: 'small' }} lineClamp={1}>
        {data.branch}
      </Text>
    </>
  )
}

export const RenderYamlPath: Renderer<CellProps<GitSyncEntityDTO>> = ({ row }) => {
  const data = row.original
  const { showSuccess } = useToaster()
  return (
    <>
      <Text inline lineClamp={1}>
        {data.filePath}
      </Text>
      <Icon
        name={'copy'}
        margin={{ left: 'small' }}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          copy(data.filePath || '')
          showSuccess(i18n.filePathCopied)
        }}
      ></Icon>
    </>
  )
}

export const getEntityHeaderText = (data: GitSyncEntityListDTO): string => {
  return data?.entityType?.toUpperCase() + ' (' + data?.count + ')'
}

export const getTableColumns = (sortingDisabled: boolean): Column<GitSyncEntityDTO>[] => {
  return [
    {
      Header: i18n.heading.entity,
      accessor: 'entityName',
      width: '25%',
      Cell: RenderEntity,
      disableSortBy: sortingDisabled
    },
    {
      Header: i18n.heading.details,
      accessor: 'repositoryName',
      width: '30%',
      Cell: RenderRootfolder,
      disableSortBy: sortingDisabled
    },
    {
      Header: i18n.heading.yamlFilePath,
      accessor: 'filePath',
      width: '45%',
      Cell: RenderYamlPath,
      disableSortBy: sortingDisabled
    }
  ]
}
