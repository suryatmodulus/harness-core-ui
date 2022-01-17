/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Container, ExpandingSearchInput, PageHeader, PageBody } from '@wings-software/uicore'
import {
  useListReferredByEntities,
  ResponsePageEntitySetupUsageDTO,
  ListReferredByEntitiesQueryParams
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { UseGetMockData } from '@common/utils/testUtils'
import EntityUsageList from './views/EntityUsageListView/EntityUsageList'
import css from './EntityUsage.module.scss'

interface EntityUsageProps {
  entityIdentifier: string
  entityType: ListReferredByEntitiesQueryParams['referredEntityType']
  mockData?: UseGetMockData<ResponsePageEntitySetupUsageDTO>
}
const EntityUsage: React.FC<EntityUsageProps> = props => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [page, setPage] = useState(0)

  const { data, loading, refetch, error } = useListReferredByEntities({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      identifier: props.entityIdentifier,
      referredEntityType: props.entityType,
      searchTerm: searchTerm,
      pageIndex: page,
      pageSize: 10
    },
    debounce: 300,
    mock: props.mockData
  })

  return (
    <>
      <PageHeader
        className={css.secondHeader}
        size="standard"
        title={undefined}
        toolbar={
          <Container>
            <Layout.Horizontal>
              <ExpandingSearchInput
                alwaysExpanded
                onChange={text => {
                  setPage(0)
                  setSearchTerm(text.trim())
                }}
                className={css.search}
                width={350}
              />
            </Layout.Horizontal>
          </Container>
        }
      />
      <PageBody
        loading={loading}
        retryOnError={() => refetch()}
        error={(error?.data as Error)?.message || error?.message}
        noData={
          !searchTerm
            ? {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('common.noRefData')
              }
            : {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('entityReference.noRecordFound')
              }
        }
      >
        <EntityUsageList entityData={data} gotoPage={pageNumber => setPage(pageNumber)} />
      </PageBody>
    </>
  )
}

export default EntityUsage
