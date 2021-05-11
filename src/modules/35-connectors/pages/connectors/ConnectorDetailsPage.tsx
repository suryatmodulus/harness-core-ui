import React from 'react'
import { Layout, Container, Icon, Text, Color } from '@wings-software/uicore'
import { Tag } from '@blueprintjs/core'
import cx from 'classnames'
import { Link, useParams, useLocation } from 'react-router-dom'
import { Page } from '@common/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useGetConnector, ConnectorResponse, useUpdateConnector, useGetOrganizationAggregateDTO } from 'services/cd-ng'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { useStrings } from 'framework/strings'
import ActivityHistory from '@connectors/components/activityHistory/ActivityHistory/ActivityHistory'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ProjectPathProps, ConnectorPathProps } from '@common/interfaces/RouteInterfaces'
import { PageError } from '@common/components/Page/PageError'
import ReferencedBy from './ReferencedBy/ReferencedBy'
import ConnectorView from './ConnectorView'
import { getIconByType } from './utils/ConnectorUtils'
import css from './ConnectorDetailsPage.module.scss'

interface Categories {
  [key: string]: string
}

const ConnectorDetailsPage: React.FC<{ mockData?: any }> = props => {
  const { getString } = useStrings()
  const [activeCategory, setActiveCategory] = React.useState(0)
  const { connectorId, accountId, orgIdentifier, projectIdentifier } = useParams<
    ProjectPathProps & ConnectorPathProps
  >()
  const { pathname } = useLocation()
  const { loading, data, refetch, error } = useGetConnector({
    identifier: connectorId as string,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier as string,
      projectIdentifier: projectIdentifier as string
    },
    mock: props.mockData
  })
  const connectorName = data?.data?.connector?.name
  useDocumentTitle([connectorName || '', getString('connectorsLabel')])

  const categories: Categories = {
    connection: getString('connection'),
    refrencedBy: getString('refrencedBy'),
    activityHistory: getString('activityHistoryLabel')
  }

  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: accountId } })

  const RenderBreadCrumb: React.FC = () => {
    if (projectIdentifier) {
      return renderCommonBreadCrumb(props)
    } else {
      return orgIdentifier ? RenderBreadCrumbForOrg(props) : renderCommonBreadCrumb(props)
    }
  }

  const RenderBreadCrumbForOrg: React.FC = () => {
    const { data: orgData } = useGetOrganizationAggregateDTO({
      identifier: orgIdentifier,
      queryParams: {
        accountIdentifier: accountId
      }
    })

    return (
      <Layout.Horizontal spacing="xsmall">
        <Link className={css.breadCrumb} to={`${pathname.substring(0, pathname.lastIndexOf('/resources'))}`}>
          {orgData?.data && orgData?.data?.organizationResponse.organization.name}
        </Link>
        <span>/</span>
        {renderCommonBreadCrumb(props)}
      </Layout.Horizontal>
    )
  }

  const renderCommonBreadCrumb: React.FC = () => {
    return (
      <Layout.Horizontal spacing="xsmall">
        <Link className={css.breadCrumb} to={`${pathname.substring(0, pathname.lastIndexOf('/'))}`}>
          {getString('resources')}
        </Link>
        <span>/</span>
        <Link className={css.breadCrumb} to={`${pathname.substring(0, pathname.lastIndexOf('/'))}`}>
          {getString('connectorsLabel')}
        </Link>
      </Layout.Horizontal>
    )
  }

  const RenderGitDetails: React.FC = () => {
    if (data?.data?.gitDetails?.objectId) {
      return (
        <Layout.Horizontal border={{ left: true, color: Color.GREY_300 }} spacing="medium">
          <Layout.Horizontal spacing="small">
            <Icon name="repository" margin={{ left: 'large' }}></Icon>
            <Text>{`${data?.data?.gitDetails?.rootFolder}${data?.data?.gitDetails?.filePath}`}</Text>
          </Layout.Horizontal>

          <Layout.Horizontal spacing="small">
            <Icon name="git-new-branch" margin={{ left: 'large' }}></Icon>
            <Text>{data?.data?.gitDetails?.branch}</Text>
          </Layout.Horizontal>
        </Layout.Horizontal>
      )
    } else {
      return <></>
    }
  }

  const renderTitle: React.FC = () => {
    return (
      <Layout.Vertical padding={{ left: 'xsmall' }}>
        {RenderBreadCrumb(props)}
        <Layout.Horizontal spacing="small">
          <Icon
            margin={{ left: 'xsmall', right: 'xsmall' }}
            name={getIconByType(data?.data?.connector?.type)}
            size={35}
          ></Icon>
          <Container>
            <Text color={Color.GREY_800} font={{ size: 'medium', weight: 'bold' }}>
              {connectorName}
            </Text>
            <Layout.Horizontal spacing="small">
              <Text color={Color.GREY_400}>{data?.data?.connector?.identifier}</Text>
              <RenderGitDetails />
            </Layout.Horizontal>
          </Container>
        </Layout.Horizontal>
      </Layout.Vertical>
    )
  }

  const getPageBody = (): React.ReactElement => {
    if (loading) {
      return <PageSpinner />
    }
    if (error) {
      return (
        <PageError
          message={(error.data as Error)?.message || error.message}
          onClick={/* istanbul ignore next */ () => refetch()}
        />
      )
    }
    if (activeCategory === 0) {
      return data?.data?.connector?.type ? (
        <ConnectorView
          type={data.data.connector.type}
          updateConnector={updateConnector}
          response={data.data || ({} as ConnectorResponse)}
          refetchConnector={refetch}
        />
      ) : (
        <NoDataCard message={getString('connectors.connectorNotFound')} icon="question" />
      )
    }
    if (activeCategory === 1 && data) {
      return (
        <ReferencedBy
          accountId={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          entityType={'Connectors'}
          entityIdentifier={data.data?.connector?.identifier}
        />
      )
    }
    if (activeCategory === 2 && data) {
      return (
        <ActivityHistory referredEntityType="Connectors" entityIdentifier={data.data?.connector?.identifier || ''} />
      )
    }
    return <></>
  }

  return (
    <>
      <Page.Header
        size="large"
        className={css.header}
        title={renderTitle(props)}
        toolbar={
          <Container>
            <Layout.Horizontal spacing="medium">
              {Object.keys(categories).map((item, index) => {
                return (
                  <Tag
                    className={cx(css.tags, { [css.activeTag]: activeCategory === index })}
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
