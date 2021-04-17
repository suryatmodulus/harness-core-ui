import React from 'react'
import { Layout, Container, Icon, Text, Color } from '@wings-software/uicore'
import { Tag } from '@blueprintjs/core'
import cx from 'classnames'
import { Link, useParams, useLocation } from 'react-router-dom'
import { Page } from '@common/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useGetConnector, ConnectorResponse, useUpdateConnector, useGetOrganizationAggregateDTO } from 'services/cd-ng'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { useStrings } from 'framework/exports'
import ActivityHistory from '@connectors/components/activityHistory/ActivityHistory/ActivityHistory'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
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
  const { connectorId, accountId, orgIdentifier, projectIdentifier }: any = useParams()
  const { pathname } = useLocation()
  const { loading, data, refetch } = useGetConnector({
    identifier: connectorId as string,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier as string,
      projectIdentifier: projectIdentifier as string
    },
    mock: props.mockData
  })
  const connectorName = data?.data?.connector?.name
  const titleStrings = [
    getString('resources'),
    getString('connectors.label'),
    ...(connectorName ? [connectorName] : [])
  ]
  useDocumentTitle(titleStrings)

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
          {getString('connectors.label')}
        </Link>
      </Layout.Horizontal>
    )
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
            <Text color={Color.GREY_400}>{data?.data?.connector?.identifier}</Text>
          </Container>
        </Layout.Horizontal>
      </Layout.Vertical>
    )
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
      <Page.Body>
        {activeCategory === 0 ? (
          !loading ? (
            data?.data?.connector?.type ? (
              <ConnectorView
                type={data.data.connector.type}
                updateConnector={updateConnector}
                response={data.data || ({} as ConnectorResponse)}
                refetchConnector={refetch}
              />
            ) : (
              <NoDataCard message={getString('connectors.connectorNotFound')} icon="question" />
            )
          ) : (
            <PageSpinner />
          )
        ) : null}
        {activeCategory === 1 ? (
          !loading && data ? (
            <ReferencedBy
              accountId={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              entityType={'Connectors'}
              entityIdentifier={data.data?.connector?.identifier}
            />
          ) : (
            <PageSpinner />
          )
        ) : null}
        {activeCategory === 2 ? (
          !loading && data ? (
            <ActivityHistory
              referredEntityType="Connectors"
              entityIdentifier={data.data?.connector?.identifier || ''}
            />
          ) : (
            <PageSpinner />
          )
        ) : null}
      </Page.Body>
    </>
  )
}

export default ConnectorDetailsPage
