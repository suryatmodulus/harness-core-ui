/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import {
  Layout,
  Container,
  Icon,
  Text,
  Color,
  SelectOption,
  Select,
  PageSpinner,
  NoDataCard,
  PageError
} from '@wings-software/uicore'
import { Menu, Tag } from '@blueprintjs/core'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import {
  useGetConnector,
  ConnectorResponse,
  EntityGitDetails,
  useGetListOfBranchesWithStatus,
  GitBranchDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import ActivityHistory from '@connectors/components/activityHistory/ActivityHistory/ActivityHistory'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ProjectPathProps, ConnectorPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import EntitySetupUsage from '@common/pages/entityUsage/EntityUsage'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import ConnectorView from './ConnectorView'
import { getIconByType } from './utils/ConnectorUtils'
import css from './ConnectorDetailsPage.module.scss'

interface Categories {
  [key: string]: string
}

interface RenderViewBasisActiveCategoryProps {
  activeCategory: number
  data: ConnectorResponse
  refetch: () => Promise<void>
}

const RenderViewBasisActiveCategory: React.FC<RenderViewBasisActiveCategoryProps> = ({
  activeCategory,
  data,
  refetch
}) => {
  const { getString } = useStrings()
  switch (activeCategory) {
    case 0:
      return data.connector?.type ? (
        <ConnectorView
          type={data.connector.type}
          response={data || ({} as ConnectorResponse)}
          refetchConnector={refetch}
        />
      ) : (
        <NoDataCard message={getString('connectors.connectorNotFound')} icon="question" />
      )
    case 1:
      if (data.connector?.identifier) {
        return <EntitySetupUsage entityType={'Connectors'} entityIdentifier={data.connector?.identifier} />
      }
      return <></>
    case 2:
      return <ActivityHistory referredEntityType="Connectors" entityIdentifier={data.connector?.identifier || ''} />
    default:
      return <></>
  }
}

const ConnectorDetailsPage: React.FC<{ mockData?: any }> = props => {
  const { getString } = useStrings()
  const [data, setData] = React.useState<ConnectorResponse>({})
  const [activeCategory, setActiveCategory] = React.useState(0)
  const [selectedBranch, setSelectedBranch] = React.useState<string>('')
  const [branchSelectOptions, setBranchSelectOptions] = React.useState<SelectOption[]>([])
  const [searchTerm, setSearchTerm] = React.useState<string>('')
  const { connectorId, accountId, orgIdentifier, projectIdentifier, module } =
    useParams<PipelineType<ProjectPathProps & ConnectorPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<EntityGitDetails>()

  const defaultQueryParam = {
    accountIdentifier: accountId,
    orgIdentifier: orgIdentifier as string,
    projectIdentifier: projectIdentifier as string
  }

  const {
    loading,
    data: connectorData,
    refetch,
    error
  } = useGetConnector({
    identifier: connectorId as string,
    queryParams: { ...defaultQueryParam, repoIdentifier, branch },
    mock: props.mockData
  })

  const connectorName = data?.connector?.name
  const gitDetails = data?.gitDetails

  useEffect(() => {
    if (!loading && connectorData?.data) {
      setData(connectorData.data)
      setSelectedBranch(connectorData?.data?.gitDetails?.branch as string)
    }
  }, [connectorData, loading])

  const {
    data: branchList,
    loading: loadingBranchList,
    refetch: getListOfBranchesWithStatus
  } = useGetListOfBranchesWithStatus({
    lazy: true,
    debounce: 500
  })

  useEffect(() => {
    const repoId = connectorData?.data?.gitDetails?.repoIdentifier || data?.gitDetails?.repoIdentifier
    if (repoId) {
      getListOfBranchesWithStatus({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          yamlGitConfigIdentifier: repoId,
          page: 0,
          size: 10,
          searchTerm
        }
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, searchTerm])

  useEffect(() => {
    if (!loadingBranchList) {
      setBranchSelectOptions(
        branchList?.data?.branches?.content?.map((item: GitBranchDTO) => {
          return {
            label: item.branchName ?? '',
            value: item.branchName ?? ''
          }
        }) || []
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingBranchList])

  useDocumentTitle([connectorName || connectorData?.data?.connector?.name || '', getString('connectorsLabel')])

  const categories: Categories = {
    connection: getString('overview'),
    refrencedBy: getString('refrencedBy'),
    activityHistory: getString('activityHistoryLabel')
  }

  const RenderBreadCrumb: React.FC = () => {
    const breadCrumbs = [
      {
        url: routes.toConnectors({ accountId, orgIdentifier, projectIdentifier, module }),
        label: getString('connectorsLabel')
      }
    ]

    if (getScopeFromDTO({ accountId, orgIdentifier, projectIdentifier }) === Scope.ACCOUNT) {
      breadCrumbs.unshift({
        url: routes.toAccountResources({ accountId }),
        label: getString('common.accountResources')
      })
    }

    return <NGBreadcrumbs links={breadCrumbs} />
  }

  const handleBranchClick = (selected: string): void => {
    if (selected !== selectedBranch) {
      //Avoid any state change or API call if current branh is selected again
      setSelectedBranch(selected)
      refetch({
        queryParams:
          repoIdentifier && selected ? { ...defaultQueryParam, repoIdentifier, branch: selected } : defaultQueryParam
      })
    }
  }

  const RenderGitDetails = useMemo(() => {
    return (
      <Layout.Horizontal border={{ left: true, color: Color.GREY_300 }} spacing="medium">
        <Layout.Horizontal spacing="small">
          <Icon name="repository" margin={{ left: 'large' }}></Icon>
          <Text lineClamp={1} className={css.filePath}>{`${gitDetails?.rootFolder}${gitDetails?.filePath}`}</Text>
        </Layout.Horizontal>

        <Layout.Horizontal spacing="small">
          <Icon name="git-new-branch" margin={{ left: 'large' }}></Icon>
          <Select
            name="branch"
            className={css.gitBranch}
            value={{ label: selectedBranch, value: selectedBranch }}
            items={branchSelectOptions}
            onQueryChange={(query: string) => {
              setSearchTerm(query)
            }}
            itemRenderer={(item: SelectOption): React.ReactElement => {
              return (
                <Menu.Item
                  key={item.value as string}
                  active={item.value === selectedBranch}
                  onClick={() => handleBranchClick(item.value as string)}
                  text={item.value}
                />
              )
            }}
          />
          {loadingBranchList ? <Icon margin={{ top: 'xsmall' }} name="spinner" /> : null}
        </Layout.Horizontal>
      </Layout.Horizontal>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchSelectOptions, selectedBranch, loadingBranchList])

  const renderTitle = useMemo(
    () => (
      <Layout.Vertical>
        {RenderBreadCrumb(props)}
        <Layout.Horizontal spacing="small">
          <Icon
            margin={{ right: 'xsmall' }}
            name={getIconByType(connectorData?.data?.connector?.type || data?.connector?.type)}
            size={35}
          ></Icon>
          <Container>
            <ScopedTitle
              title={{
                [Scope.PROJECT]: `${getString('connectorsLabel')}: ${
                  connectorData?.data?.connector?.name || connectorName || ''
                }`,
                [Scope.ORG]: getString('connectors.connectorsTitle'),
                [Scope.ACCOUNT]: getString('connectors.connectorsTitle')
              }}
            />
            <Layout.Horizontal spacing="small">
              <Text color={Color.GREY_400}>
                {connectorData?.data?.connector?.identifier || data?.connector?.identifier}
              </Text>
              {activeCategory === 0 && gitDetails?.objectId ? RenderGitDetails : null}
            </Layout.Horizontal>
          </Container>
        </Layout.Horizontal>
      </Layout.Vertical>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectorData, branchSelectOptions, activeCategory, selectedBranch, loadingBranchList]
  )

  const getPageBody = (): React.ReactElement => {
    if (loading) {
      return <PageSpinner />
    }
    if (error) {
      return (
        <PageError
          message={(error.data as Error)?.message || error.message}
          onClick={() =>
            refetch({
              queryParams: selectedBranch
                ? {
                    ...defaultQueryParam,
                    repoIdentifier: connectorData?.data?.gitDetails?.repoIdentifier,
                    branch: selectedBranch
                  }
                : defaultQueryParam
            })
          }
        />
      )
    }
    return <RenderViewBasisActiveCategory activeCategory={activeCategory} data={data} refetch={refetch} />
  }

  return (
    <>
      <Page.Header
        size="large"
        className={css.header}
        title={renderTitle}
        toolbar={
          <Container>
            <Layout.Horizontal spacing="medium">
              {Object.keys(categories).map((item, index) => {
                return (
                  <Tag
                    className={cx(css.tags, css.small, { [css.active]: activeCategory === index })}
                    onClick={() => setActiveCategory(index)}
                    key={item + index}
                  >
                    {categories[item]}
                  </Tag>
                )
              })}
            </Layout.Horizontal>
          </Container>
        }
      />
      <Page.Body>{getPageBody()}</Page.Body>
    </>
  )
}

export default ConnectorDetailsPage
