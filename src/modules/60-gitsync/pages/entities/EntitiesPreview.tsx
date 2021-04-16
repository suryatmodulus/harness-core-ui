import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Color, Layout, Text } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'
import {
  GitSyncEntityListDTO,
  GitSyncEntityDTO,
  useListGitSyncEntitiesSummaryForRepoAndTypes,
  GitSyncConfig,
  GitSyncRepoFiles,
  GitEntityFilterProperties,
  ListGitSyncEntitiesByTypePathParams
} from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/strings'
import { Entities } from '@common/interfaces/GitSyncInterface'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getEntityHeaderText, getTableColumns } from './EntityHelper'
import EntitiesListing from './EntitiesListing'
import css from './GitSyncEntityTab.module.scss'

interface EntityListViewProps {
  data: GitSyncEntityListDTO
  hideHeaders?: boolean
}

interface EntitiesPreviewProps {
  selectedProduct: GitEntityFilterProperties['moduleType']
  repo: GitSyncConfig
}

type EntitiesTypeContainerProps = EntitiesPreviewProps & {
  entityList: GitSyncEntityListDTO
  key: string
}

const previewListSize = 2

export const EntityListView: React.FC<EntityListViewProps> = props => {
  const { data } = props

  return (
    <>
      {props.hideHeaders ? <Text margin={{ left: 'xxxlarge' }}>{getEntityHeaderText(data)}</Text> : null}
      <Table<GitSyncEntityDTO> className={css.table} columns={getTableColumns()} data={data.gitSyncEntities || []} />
    </>
  )
}

const EntitiesTypeContainer: React.FC<EntitiesTypeContainerProps> = props => {
  const [selectedEntity, setSelectedEntity] = useState('')
  const { entityList, repo, selectedProduct } = props
  const { getString } = useStrings()

  return React.useMemo(
    () => (
      <Container className={css.entityTypeContainer}>
        <Text margin="large" font={{ size: 'medium', weight: 'bold' }} color={Color.GREY_900}>
          {getEntityHeaderText(entityList)}
        </Text>
        {selectedEntity ? (
          <EntitiesListing
            selectedProduct={selectedProduct}
            entityType={selectedEntity as ListGitSyncEntitiesByTypePathParams['entityType']}
            gitSyncConfigId={repo.identifier}
            branch={repo.branch}
            backToSummary={() => {
              setSelectedEntity('')
            }}
          ></EntitiesListing>
        ) : (
          <EntityListView data={entityList}></EntityListView>
        )}

        {!selectedEntity && entityList?.count && entityList.count > previewListSize ? (
          <Text
            color={Color.BLUE_500}
            padding={{ left: 'huge', bottom: 'large' }}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedEntity(entityList?.entityType || '')
            }}
          >
            {getString('gitsync.seeMore')}
          </Text>
        ) : null}
      </Container>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entityList, selectedEntity]
  )
}

const EntitiesPreview: React.FC<EntitiesPreviewProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [repoFileList, setRepoFileList] = useState<GitSyncRepoFiles[]>([])
  const { getString } = useStrings()

  const defaultFilterProps = {
    moduleType: props.selectedProduct,
    gitSyncConfigIdentifiers: [props.repo.identifier] as GitEntityFilterProperties['gitSyncConfigIdentifiers'],
    searchTerm: '',
    entityTypes: Object.values(Entities) as GitEntityFilterProperties['entityTypes']
  }

  const { mutate: fetchEntities, loading: loadingEntityList } = useListGitSyncEntitiesSummaryForRepoAndTypes({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      size: previewListSize
    }
  })

  useEffect(() => {
    fetchEntities(defaultFilterProps).then(response => {
      setRepoFileList(response?.data?.gitSyncRepoFilesList || [])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return React.useMemo(
    () =>
      loadingEntityList ? (
        <Spinner />
      ) : (
        <Container padding="small">
          <Layout.Vertical spacing="small">
            {repoFileList?.length > 0
              ? repoFileList?.[0]?.gitSyncEntityLists?.map?.((entityList: GitSyncEntityListDTO) => {
                  return (
                    <EntitiesTypeContainer
                      key={entityList.entityType || ''}
                      entityList={entityList}
                      {...pick(props, ['selectedProduct', 'repo'])}
                    ></EntitiesTypeContainer>
                  )
                })
              : getString('noData')}
          </Layout.Vertical>
        </Container>
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [repoFileList]
  )
}

export default EntitiesPreview
