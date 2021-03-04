import React, { useState } from 'react'
import type { CellProps } from 'react-table'
import {
  Text,
  Color,
  Layout,
  Container,
  Button,
  Icon,
  Link,
  ExpandingSearchInput,
  Popover
} from '@wings-software/uicore'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useHistory } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { Classes, Drawer, Menu, Position } from '@blueprintjs/core'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import {
  AllResourcesOfAccountResponse,
  Service,
  ServiceSavings,
  useAllServiceResources,
  useGetServices,
  useHealthOfService,
  useRequestsOfService,
  useSavingsOfService
} from 'services/lw'
import { Page } from '@common/components/Page/Page'
import Table from '@common/components/Table/Table'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import COGatewayAnalytics from './COGatewayAnalytics'
import COGatewayCumulativeAnalytics from './COGatewayCumulativeAnalytics'
import odIcon from './images/ondemandIcon.svg'
import spotIcon from './images/spotIcon.svg'
import { getInstancesLink, getRelativeTime, getStateTag, getRiskGaugeChartOptions } from './Utils'
// import landingPageSVG from './images/landingPageGraphic.svg'
import landingPageBannerImage1 from './images/landingPage/1.svg'
import landingPageBannerImage2 from './images/landingPage/2.svg'
import landingPageBannerImage3 from './images/landingPage/3.svg'
import landingPageBannerImage4 from './images/landingPage/4.svg'
import landingPageBannerImage5 from './images/landingPage/5.svg'
import landingPageBannerImage6 from './images/landingPage/6.svg'
import landingPageBannerImage7 from './images/landingPage/7.svg'
import landingPageBannerImage8 from './images/landingPage/8.svg'
import landingPageBannerImage9 from './images/landingPage/9.svg'
import landingPageBannerImage10 from './images/landingPage/10.svg'
import landingPageBannerImage11 from './images/landingPage/11.svg'
import landingPageBannerImage12 from './images/landingPage/12.svg'
import landingPageBannerImage13 from './images/landingPage/13.svg'
import css from './COGatewayList.module.scss'

interface AnimatedGraphicContainerProps {
  imgList: Array<string>
}

function IconCell(tableProps: CellProps<Service>): JSX.Element {
  return (
    <Layout.Horizontal spacing="medium">
      <img
        className={css.fulFilmentIcon}
        src={tableProps.value == 'spot' ? spotIcon : odIcon}
        alt=""
        width={'20px'}
        height={'19px'}
        aria-hidden
      />
      <Text lineClamp={3} color={Color.GREY_500}>
        {tableProps.value}
      </Text>
    </Layout.Horizontal>
  )
}
function TimeCell(tableProps: CellProps<Service>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.GREY_500}>
      {tableProps.value} mins
    </Text>
  )
}
function NameCell(tableProps: CellProps<Service>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK} style={{ fontWeight: 600 }}>
      {/* <Icon name={tableProps.row.original.provider.icon as IconName}></Icon> */}
      {tableProps.value}
    </Text>
  )
}

const landingPageGraphicsImages: Array<string> = [
  landingPageBannerImage1,
  landingPageBannerImage2,
  landingPageBannerImage3,
  landingPageBannerImage4,
  landingPageBannerImage5,
  landingPageBannerImage6,
  landingPageBannerImage7,
  landingPageBannerImage8,
  landingPageBannerImage9,
  landingPageBannerImage10,
  landingPageBannerImage11,
  landingPageBannerImage12,
  landingPageBannerImage13
]

const AnimatedGraphicContainer: React.FC<AnimatedGraphicContainerProps> = props => {
  const [currImgPos, setCurrImgPos] = React.useState<number>(0)
  React.useEffect(() => {
    const animationIntervalId = setInterval(() => {
      setCurrImgPos(prevImgPos => (prevImgPos === 12 ? 0 : prevImgPos + 1))
    }, 1000)
    return () => {
      clearInterval(animationIntervalId)
    }
  }, [])

  return (
    <>
      <img src={props?.imgList?.[currImgPos]} height={'224px'} width={'603px'} />
    </>
  )
}

const COGatewayList: React.FC = () => {
  const history = useHistory()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const { showError } = useToaster()
  // const [page, setPage] = useState(0)
  const [selectedService, setSelectedService] = useState<Service>()
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  function SavingsCell(tableProps: CellProps<Service>): JSX.Element {
    const { data, loading } = useSavingsOfService({
      org_id: orgIdentifier, // eslint-disable-line
      projectID: projectIdentifier, // eslint-disable-line
      serviceID: tableProps.row.original.id as number,
      debounce: 300
    })
    return (
      <Layout.Horizontal spacing="large">
        <HighchartsReact
          highchart={Highcharts}
          options={
            data?.response != null
              ? getRiskGaugeChartOptions((data?.response as ServiceSavings).savings_percentage as number)
              : getRiskGaugeChartOptions(0)
          }
        />
        <Text className={css.savingsAmount}>
          {data?.response != null ? (
            `$${Math.round(((data?.response as ServiceSavings).actual_savings as number) * 100) / 100}`
          ) : !loading ? (
            0
          ) : (
            <Icon name="spinner" size={12} color="blue500" />
          )}
        </Text>
      </Layout.Horizontal>
    )
  }
  function ActivityCell(tableProps: CellProps<Service>): JSX.Element {
    const { data, loading } = useRequestsOfService({
      org_id: orgIdentifier, // eslint-disable-line
      projectID: projectIdentifier, // eslint-disable-line
      serviceID: tableProps.row.original.id as number,
      debounce: 300
    })
    return (
      <>
        {data?.response?.length ? (
          <Layout.Horizontal spacing="medium">
            <Icon name="history" />
            <Text lineClamp={3} color={Color.GREY_500}>
              {getRelativeTime(data.response[0].created_at as string, 'YYYY-MM-DDTHH:mm:ssZ')}
            </Text>
          </Layout.Horizontal>
        ) : !loading ? (
          '-'
        ) : (
          <Icon name="spinner" size={12} color="blue500" />
        )}
      </>
    )
  }
  function ResourcesCell(tableProps: CellProps<Service>): JSX.Element {
    const { data, loading } = useHealthOfService({
      org_id: orgIdentifier, // eslint-disable-line
      projectID: projectIdentifier, // eslint-disable-line
      serviceID: tableProps.row.original.id as number,
      debounce: 300
    })
    const { data: resources, loading: resourcesLoading, error: resourcesError } = useAllServiceResources({
      org_id: orgIdentifier, // eslint-disable-line
      project_id: projectIdentifier, // eslint-disable-line
      service_id: tableProps.row.original.id as number, // eslint-disable-line
      debounce: 300
    })
    if (resourcesError) {
      showError(`could not load resources for rule ${tableProps.row.original.name}`)
    }
    return (
      <Container>
        <Layout.Vertical spacing="medium">
          <Layout.Horizontal spacing="xxxsmall">
            <Text style={{ alignSelf: 'center' }}>No. of instances:</Text>
            {!resourcesLoading && resources?.response ? (
              <Link
                href={getInstancesLink(resources as AllResourcesOfAccountResponse)}
                target="_blank"
                style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                onClick={e => {
                  e.stopPropagation()
                }}
              >
                {resources?.response?.length}
              </Link>
            ) : (
              <Icon name="spinner" size={12} color="blue500" />
            )}
            {data?.response?.['state'] != null ? (
              getStateTag(data?.response?.['state'])
            ) : !loading ? (
              getStateTag('down')
            ) : (
              <Icon name="spinner" size={12} color="blue500" />
            )}
          </Layout.Horizontal>
          <Layout.Horizontal spacing="large">
            {tableProps.row.original.custom_domains?.length ? (
              <Text lineClamp={3} color={Color.GREY_500}>
                Custom Domain:
                <Link
                  href={`http://${tableProps.row.original.custom_domains[0]}`}
                  target="_blank"
                  style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onClick={e => {
                    e.stopPropagation()
                  }}
                >
                  {tableProps.row.original.custom_domains?.join(',')}
                </Link>
              </Text>
            ) : (
              <Text lineClamp={3} color={Color.GREY_500}>
                Host name:
                <Link
                  href={`http://${tableProps.row.original.host_name}`}
                  target="_blank"
                  style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onClick={e => {
                    e.stopPropagation()
                  }}
                >
                  {tableProps.row.original.host_name}
                </Link>
              </Text>
            )}
          </Layout.Horizontal>
        </Layout.Vertical>
        {/* <Icon name={tableProps.row.original.provider.icon as IconName}></Icon> */}
        {tableProps.value}
      </Container>
    )
  }
  function RenderColumnMenu(tableProps: CellProps<Service>): JSX.Element {
    const row = tableProps.row
    const data = row.original.id
    const [menuOpen, setMenuOpen] = useState(false)

    return (
      <Layout.Horizontal className={css.layout}>
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          className={Classes.DARK}
          position={Position.BOTTOM_RIGHT}
        >
          <Button
            minimal
            icon="Options"
            iconProps={{ size: 24 }}
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(true)
            }}
            data-testid={`menu-${data}`}
          />
          <Menu style={{ minWidth: 'unset' }}>
            {row.original.disabled ? (
              <Menu.Item
                icon="play"
                text="Enable"
                onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                  e.stopPropagation()
                  alert('you are enabling')
                }}
              />
            ) : (
              <Menu.Item
                icon="disable"
                text="Disable"
                onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                  e.stopPropagation()
                  alert('you are disabling')
                }}
              />
            )}
            <Menu.Item
              icon="edit"
              text="Edit"
              onClick={() =>
                history.push(
                  routes.toCECOEditGateway({
                    orgIdentifier: row.original.org_id as string,
                    projectIdentifier: row.original.project_id as string,
                    accountId: row.original.account_identifier as string,
                    gatewayIdentifier: row.original.id?.toString() as string
                  })
                )
              }
              // onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
              //   e.stopPropagation()
              //   alert('you are editing')
              // }}
            />
            <Menu.Item
              icon="trash"
              text="Delete"
              onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                e.stopPropagation()
                alert('you are deleting')
              }}
            />
          </Menu>
        </Popover>
      </Layout.Horizontal>
    )
  }
  const { data, error, loading } = useGetServices({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    debounce: 300
  })
  if (error) {
    showError(error.data || error.message)
  }

  if (loading) {
    return (
      <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
        <PageSpinner />
      </div>
    )
  }

  return (
    <Container background={Color.WHITE} height="100vh">
      {!loading && !data?.response ? (
        <>
          <Breadcrumbs
            className={css.breadCrumb}
            links={[
              {
                url: routes.toCECORules({ orgIdentifier, projectIdentifier, accountId }),
                label: 'Autostopping Rules'
              }
            ]}
          />
          <Layout.Vertical
            spacing="large"
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: '220px'
            }}
          >
            {/* <img src={landingPageSVG} alt="" width="300px"></img> */}
            <AnimatedGraphicContainer imgList={landingPageGraphicsImages} />
            <Text font="normal" style={{ lineHeight: '24px', textAlign: 'center', width: '760px', marginTop: '20px' }}>
              AutoStopping Rules dynamically make sure that your non-production workloads are running (and costing you)
              only when you’re using them, and never when they are idle. Additionally, run your workloads on fully
              orchestrated spot instances without any worry of spot interruptions. <Link href="/">Learn more</Link>
            </Text>
            <Button
              intent="primary"
              text="New Autostopping Rule"
              icon="plus"
              onClick={() =>
                history.push(
                  routes.toCECOCreateGateway({
                    orgIdentifier: orgIdentifier as string,
                    projectIdentifier: projectIdentifier as string,
                    accountId
                  })
                )
              }
            />
          </Layout.Vertical>
        </>
      ) : (
        <>
          {!loading ? (
            <>
              <Page.Header title="Autostopping Rules" className={css.header} />
              <Drawer
                autoFocus={true}
                enforceFocus={true}
                hasBackdrop={true}
                usePortal={true}
                canOutsideClickClose={true}
                canEscapeKeyClose={true}
                isOpen={isDrawerOpen}
                onClose={() => {
                  setIsDrawerOpen(false)
                }}
                size="656px"
                style={{
                  boxShadow: '0px 2px 8px rgba(40, 41, 61, 0.04), 0px 16px 24px rgba(96, 97, 112, 0.16)',
                  borderRadius: '8px',
                  overflowY: 'scroll'
                }}
              >
                <COGatewayAnalytics service={selectedService as Service} />
              </Drawer>
              <>
                <Layout.Horizontal padding="large">
                  <Layout.Horizontal width="55%">
                    <Button
                      intent="primary"
                      text="New Autostopping Rule"
                      icon="plus"
                      onClick={() =>
                        history.push(
                          routes.toCECOCreateGateway({
                            orgIdentifier: orgIdentifier as string,
                            projectIdentifier: projectIdentifier as string,
                            accountId
                          })
                        )
                      }
                    />
                  </Layout.Horizontal>
                  <Layout.Horizontal spacing="small" width="45%" className={css.headerLayout}>
                    <Layout.Horizontal flex>
                      <ExpandingSearchInput
                        placeholder="search"
                        // onChange={text => {
                        //   // console.log(text)
                        //   // setSearchParam(text.trim())
                        // }}
                        className={css.search}
                      />
                    </Layout.Horizontal>
                  </Layout.Horizontal>
                </Layout.Horizontal>
              </>
              <Page.Body className={css.pageContainer}>
                <COGatewayCumulativeAnalytics
                  services={data?.response ? (data.response as Service[]) : []}
                ></COGatewayCumulativeAnalytics>
                <Table<Service>
                  data={data?.response ? data.response : []}
                  className={css.table}
                  // pagination={{
                  //   itemCount: 50, //data?.data?.totalItems || 0,
                  //   pageSize: 10, //data?.data?.pageSize || 10,
                  //   pageCount: 5, //data?.data?.totalPages || 0,
                  //   pageIndex: page, //data?.data?.pageIndex || 0,
                  //   gotoPage: (pageNumber: number) => setPage(pageNumber)
                  // }}
                  onRowClick={e => {
                    setSelectedService(e)
                    setIsDrawerOpen(true)
                  }}
                  columns={[
                    {
                      accessor: 'name',
                      Header: 'Name'.toUpperCase(),
                      width: '18%',
                      Cell: NameCell,
                      disableSortBy: true
                    },
                    {
                      accessor: 'idle_time_mins',
                      Header: 'Idle Time'.toUpperCase(),
                      width: '8%',
                      Cell: TimeCell,
                      disableSortBy: true
                    },
                    {
                      accessor: 'fulfilment',
                      Header: 'Compute Type'.toUpperCase(),
                      width: '12%',
                      Cell: IconCell,
                      disableSortBy: true
                    },
                    {
                      Header: 'Resources Managed By The Rule'.toUpperCase(),
                      width: '32%',
                      Cell: ResourcesCell
                    },
                    {
                      Header: 'Cumulative Savings'.toUpperCase(),
                      width: '15%',
                      Cell: SavingsCell,
                      disableSortBy: true
                    },
                    {
                      Header: 'Last Activity'.toUpperCase(),
                      width: '10%',
                      Cell: ActivityCell
                    },
                    {
                      Header: '',
                      id: 'menu',
                      accessor: row => row.id,
                      width: '5%',
                      Cell: RenderColumnMenu,
                      disableSortBy: true
                    }
                  ]}
                />
              </Page.Body>
            </>
          ) : null}
        </>
      )}
    </Container>
  )
}

export default COGatewayList
