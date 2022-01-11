import React, { useEffect, useMemo } from 'react'
import { Layout, Container, Icon, Text, Color, SelectOption, PageSpinner, PageError } from '@wings-software/uicore'
import { Tag } from '@blueprintjs/core'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import {
  useGetConnector,
  ConnectorResponse,
  EntityGitDetails,
  useGetListOfBranchesWithStatus,
  GitBranchDTO,
  ResponseConnectorResponse
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ProjectPathProps, ConnectorPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import ScopedTitle from '@common/components/Title/ScopedTitle'
import { getIconByType } from '../utils/ConnectorUtils'
import RenderViewBasisActiveCategory from '../views/RenderViewBasisActiveCategory/RenderViewBasisActiveCategory'
import ConnectorPageGitDetails from './ConnectorDetailsPageGitDetails/ConnectorPageGitDetails'
import css from './ConnectorDetailsPage.module.scss'

interface Categories {
  [key: string]: string
}

interface MockData {
  data: ResponseConnectorResponse
}

interface ConnectorDetailsPageProps {
  mockData?: MockData
}

const ConnectorDetailsPage: React.FC<ConnectorDetailsPageProps> = props => {
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
      <ConnectorPageGitDetails
        handleBranchClick={handleBranchClick}
        gitDetails={gitDetails}
        selectedBranch={selectedBranch}
        branchSelectOptions={branchSelectOptions}
        loadingBranchList={loadingBranchList}
        onQueryChange={(query: string) => {
          setSearchTerm(query)
        }}
      />
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
      const errorMessage = (error.data as Error)?.message || error.message
      return (
        <PageError
          message={errorMessage}
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
