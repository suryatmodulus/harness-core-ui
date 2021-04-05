import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Color, Layout, Text } from '@wings-software/uicore'
import { PageSpinner } from '@common/components/Page/PageSpinner'

import {
  GitSyncEntityListDTO,
  GitSyncEntityDTO,
  useListGitSyncEntitiesByProduct,
  GitSyncProductDTO
} from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import { getEntityHeaderText, getTableColumns } from './EntityHelper'
import EntitiesListing from './EntitiesListing'
import i18n from './GitSyncEntityTab.i18n'
import css from './GitSyncEntity.module.scss'

interface EntityListViewProps {
  data: GitSyncEntityListDTO
  hideHeaders?: boolean
}

interface EntitiesPreviewProps {
  selectedProduct: GitSyncProductDTO['moduleType']
}

export const EntityListView: React.FC<EntityListViewProps> = props => {
  const { data } = props

  return (
    <>
      {props.hideHeaders ? <Text margin={{ left: 'xxxlarge' }}>{getEntityHeaderText(data)}</Text> : null}
      <Table<GitSyncEntityDTO>
        className={css.table}
        columns={getTableColumns(true)}
        hideHeaders={props.hideHeaders}
        data={data.gitSyncEntities || []}
      />
    </>
  )
}

const EntitiesPreview: React.FC<EntitiesPreviewProps> = props => {
  const { accountId } = useParams()
  const previewListSize = 5
  const [selectedEntity, setSelectedEntity] = useState('')
  const { loading: loadingEntityList, data: dataAllEntities } = useListGitSyncEntitiesByProduct({
    queryParams: { accountId, moduleType: props.selectedProduct, size: previewListSize }
  })

  useEffect(() => {
    setSelectedEntity('')
  }, [props.selectedProduct])

  if (loadingEntityList) {
    return <PageSpinner />
  }

  return selectedEntity ? (
    <EntitiesListing
      entityType={selectedEntity as GitSyncEntityListDTO['entityType']}
      selectedProduct={props.selectedProduct}
      backToSummary={() => {
        setSelectedEntity('')
      }}
    ></EntitiesListing>
  ) : (
    <Container className={css.productListing} padding="small">
      <Layout.Vertical spacing="small">
        {dataAllEntities?.data?.gitSyncEntityListDTOList?.length ? (
          <EntityListView data={{} as GitSyncEntityListDTO} hideHeaders={false}></EntityListView>
        ) : null}

        {dataAllEntities?.data?.gitSyncEntityListDTOList?.map((entityList: GitSyncEntityListDTO) => {
          return (
            <React.Fragment key={entityList.entityType || ''}>
              <EntityListView data={entityList} hideHeaders={true}></EntityListView>
              {entityList?.count && entityList.count > previewListSize ? (
                <Text
                  color={Color.BLUE_500}
                  padding={{ left: 'huge', bottom: 'large' }}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedEntity(entityList?.entityType || '')
                  }}
                >{`${i18n.viewAll} ${entityList.entityType?.toUpperCase()}`}</Text>
              ) : null}
            </React.Fragment>
          )
        })}
      </Layout.Vertical>
    </Container>
  )
}

export default EntitiesPreview
