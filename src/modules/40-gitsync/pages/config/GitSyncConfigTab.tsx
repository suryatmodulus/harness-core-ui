/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import {
  Container,
  Layout,
  Page,
  Button,
  ButtonVariation,
  PageSpinner,
  ExpandingSearchInput
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { GitFullSyncEntityInfoDTO, useListFullSyncFiles } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import GitFullSyncEntityList from './GitFullSyncEntityList'

const GitSyncConfigTab: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const { data: fullSyncEntities, loading } = useListFullSyncFiles({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier, pageIndex: 0, pageSize: 10 }
  })

  const mockData: GitFullSyncEntityInfoDTO[] = [
    {
      accountIdentifier: accountId,
      branch: 'master',
      entityType: 'Connectors',
      filePath: 'connectors/dummy.yaml',
      name: 'dummy',
      orgIdentifier,
      projectIdentifier,
      repo: 'repoOne',
      retryCount: 0,
      syncStatus: 'SUCCESS'
    },
    {
      accountIdentifier: accountId,
      branch: 'master',
      entityType: 'Pipelines',
      filePath: 'pipelines/abc.yaml',
      name: 'abc',
      orgIdentifier,
      projectIdentifier,
      repo: 'repoOne',
      retryCount: 0,
      syncStatus: 'SUCCESS'
    },
    {
      accountIdentifier: accountId,
      branch: 'master',
      entityType: 'Template',
      filePath: 'template.yaml',
      name: 'template',
      orgIdentifier,
      projectIdentifier,
      repo: 'repoOne',
      retryCount: 0,
      syncStatus: 'FAILED'
    },
    {
      accountIdentifier: accountId,
      branch: 'dev',
      entityType: 'Pipelines',
      filePath: 'pipeline.yaml',
      name: 'pipeline',
      orgIdentifier,
      projectIdentifier,
      repo: 'repoOne',
      retryCount: 0,
      syncStatus: 'QUEUED'
    },
    {
      accountIdentifier: accountId,
      branch: 'dev',
      entityType: 'InputSets',
      filePath: 'inputSet.yaml',
      name: 'inputSet',
      orgIdentifier,
      projectIdentifier,
      repo: 'repoOne',
      retryCount: 0,
      syncStatus: 'FAILED'
    }
  ]
  const mockResponse = {
    content: mockData,
    empty: false,
    pageIndex: 0,
    pageItemCount: 4,
    pageSize: 10,
    totalItems: 5,
    totalPages: 1
  }

  useEffect(
    () => {
      console.log('fullSyncEntities', fullSyncEntities)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading]
  )

  return (
    <>
      <Page.SubHeader>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }} width={'100%'}>
          <Layout.Horizontal spacing="medium">
            <Button variation={ButtonVariation.SECONDARY} text={'Resync Failed Entities'}></Button>
            <Button variation={ButtonVariation.SECONDARY} text={'Edit Config'}></Button>
          </Layout.Horizontal>
          <ExpandingSearchInput
            alwaysExpanded
            width={250}
            placeholder={getString('search')}
            throttle={200}
            onChange={text => {
              console.log('SearchingText', text)
            }}
          />
        </Layout.Horizontal>
      </Page.SubHeader>
      <Page.Body>
        {loading ? (
          <PageSpinner />
        ) : mockResponse?.totalItems ? (
          <Container padding="xlarge">
            <GitFullSyncEntityList data={mockResponse} gotoPage={(page: number) => console.log(`page: ${page}`)} />
          </Container>
        ) : (
          <Page.NoDataCard message={getString('noData')} />
        )}
        {/* <TableV2<GitSyncConfig> className={css.table} columns={columns} data={gitSyncRepos || []} /> */}
      </Page.Body>
    </>
  )
}

export default GitSyncConfigTab
