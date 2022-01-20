/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
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
  Popover,
  HarnessDocTooltip,
  Heading,
  PageSpinner,
  Page,
  TableV2
} from '@wings-software/uicore'
import { isEmpty as _isEmpty } from 'lodash-es'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useHistory, useParams } from 'react-router-dom'
import { Classes, Drawer, Menu, Position } from '@blueprintjs/core'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import {
  AllResourcesOfAccountResponse,
  Service,
  ServiceSavings,
  useAllServiceResources,
  useGetServices,
  useHealthOfService,
  useRequestsOfService,
  useSavingsOfService,
  useGetServiceDiagnostics,
  ServiceError
} from 'services/lw'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { String, useStrings } from 'framework/strings'
import useDeleteServiceHook from '@ce/common/useDeleteService'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import { useFeature } from '@common/hooks/useFeatures'
import RbacButton from '@rbac/components/Button/Button'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import COGatewayAnalytics from './COGatewayAnalytics'
import COGatewayCumulativeAnalytics from './COGatewayCumulativeAnalytics'
import odIcon from './images/ondemandIcon.svg'
import spotIcon from './images/spotIcon.svg'
import { getInstancesLink, getRelativeTime, getStateTag, getRiskGaugeChartOptions } from './Utils'
import useToggleRuleState from './useToggleRuleState'
import TextWithToolTip, { textWithToolTipStatus } from '../TextWithTooltip/TextWithToolTip'
import landingPageSVG from './images/AutostoppingRuleIllustration.svg'
import spotDisableIcon from './images/spotDisabled.svg'
import onDemandDisableIcon from './images/onDemandDisabled.svg'
import refreshIcon from './images/refresh.svg'
import css from './COGatewayList.module.scss'

const textColor: { [key: string]: string } = {
  disable: '#6B6D85'
}

function IconCell(tableProps: CellProps<Service>): JSX.Element {
  const isK8sRule = tableProps.row.original.kind === 'k8s'
  const getIcon = () => {
    return tableProps.value === 'spot'
      ? tableProps.row.original.disabled
        ? spotDisableIcon
        : spotIcon
      : tableProps.row.original.disabled
      ? onDemandDisableIcon
      : odIcon
  }
  return (
    <Layout.Horizontal spacing="medium">
      {isK8sRule ? (
        <Icon name="app-kubernetes" size={21} />
      ) : (
        <img className={css.fulFilmentIcon} src={getIcon()} alt="" width={'20px'} height={'19px'} aria-hidden />
      )}
      <Text lineClamp={3} color={tableProps.row.original.disabled ? textColor.disable : Color.GREY_500}>
        {tableProps.value}
      </Text>
    </Layout.Horizontal>
  )
}
function TimeCell(tableProps: CellProps<Service>): JSX.Element {
  return (
    <Text lineClamp={3} color={tableProps.row.original.disabled ? textColor.disable : Color.GREY_500}>
      {tableProps.value} mins
    </Text>
  )
}
function NameCell(tableProps: CellProps<Service>): JSX.Element {
  return (
    <Text
      lineClamp={3}
      color={Color.BLACK}
      style={{ fontWeight: 600, color: tableProps.row.original.disabled ? textColor.disable : 'inherit' }}
    >
      {/* <Icon name={tableProps.row.original.provider.icon as IconName}></Icon> */}
      {tableProps.value}
    </Text>
  )
}

const TOTAL_ITEMS_PER_PAGE = 5

const COGatewayList: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const { showSuccess, showError } = useToaster()
  const { featureDetail } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.RESTRICTED_AUTOSTOPPING_RULE_CREATION
    }
  })
  const [selectedService, setSelectedService] = useState<{ data: Service; index: number } | null>()
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [tableData, setTableData] = useState<Service[]>([])
  const [pageIndex, setPageIndex] = useState<number>(0)

  const {
    data: servicesData,
    error,
    loading,
    refetch: refetchServices
  } = useGetServices({
    account_id: accountId,
    queryParams: {
      accountIdentifier: accountId
    },
    debounce: 300
  })

  const trackLandingPage = () => {
    const hasData = !_isEmpty(servicesData?.response)
    if (!loading && !hasData) {
      trackEvent(USER_JOURNEY_EVENTS.LOAD_AS_LANDING_PAGE, {})
    } else if (!loading && hasData) {
      trackEvent(USER_JOURNEY_EVENTS.LOAD_AS_SUMMARY_PAGE, {})
    }
  }

  useEffect(() => {
    if (servicesData?.response) {
      setTableData(servicesData?.response || [])
    }
    trackLandingPage()
  }, [servicesData?.response])

  if (error) {
    showError(error.data || error.message, undefined, 'ce.get.svc.error')
  }

  if (_isEmpty(tableData) && loading) {
    return (
      <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
        <PageSpinner />
      </div>
    )
  }

  function SavingsCell(tableProps: CellProps<Service>): JSX.Element {
    const { data, loading: savingsLoading } = useSavingsOfService({
      account_id: accountId,
      rule_id: tableProps.row.original.id as number,
      queryParams: {
        accountIdentifier: accountId
      },
      debounce: 300
    })
    return (
      <Layout.Horizontal spacing="large">
        <HighchartsReact
          highchart={Highcharts}
          options={
            data?.response != null
              ? getRiskGaugeChartOptions(
                  (data?.response as ServiceSavings).savings_percentage as number,
                  tableProps.row.original.disabled
                )
              : getRiskGaugeChartOptions(0)
          }
        />
        <Text className={css.savingsAmount}>
          {data?.response != null ? (
            `$${Math.round(((data?.response as ServiceSavings).actual_savings as number) * 100) / 100}`
          ) : !savingsLoading ? (
            0
          ) : (
            <Icon name="spinner" size={12} color="blue500" />
          )}
        </Text>
      </Layout.Horizontal>
    )
  }
  function ActivityCell(tableProps: CellProps<Service>): JSX.Element {
    const { data, loading: activityLoading } = useRequestsOfService({
      account_id: accountId,
      rule_id: tableProps.row.original.id as number,
      queryParams: {
        accountIdentifier: accountId
      },
      debounce: 300
    })
    return (
      <>
        {data?.response?.length ? (
          <Layout.Horizontal spacing="medium">
            <Icon name="history" />
            <Text lineClamp={3} color={tableProps.row.original.disabled ? textColor.disable : Color.GREY_500}>
              {getRelativeTime(data.response[0].created_at as string, 'YYYY-MM-DDTHH:mm:ssZ')}
            </Text>
          </Layout.Horizontal>
        ) : !activityLoading ? (
          '-'
        ) : (
          <Icon name="spinner" size={12} color="blue500" />
        )}
      </>
    )
  }
  function ResourcesCell(tableProps: CellProps<Service>): JSX.Element {
    const isK8sRule = tableProps.row.original.kind === 'k8s'
    const { data, loading: healthLoading } = useHealthOfService({
      account_id: accountId,
      rule_id: tableProps.row.original.id as number,
      queryParams: {
        accountIdentifier: accountId
      },
      debounce: 300
    })

    const { data: resources, loading: resourcesLoading } = useAllServiceResources({
      account_id: accountId,
      rule_id: tableProps.row.original.id as number, // eslint-disable-line
      debounce: 300,
      lazy: isK8sRule
    })

    const hasCustomDomains = (tableProps.row.original.custom_domains?.length as number) > 0
    const isSubmittedRule = tableProps.row.original.status === 'submitted'
    const isEcsRule = !_isEmpty(tableProps.row.original.routing?.container_svc)

    const handleDomainClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      e.stopPropagation()
      if (isSubmittedRule) return
      const link = hasCustomDomains ? tableProps.row.original.custom_domains?.[0] : tableProps.row.original.host_name
      window.open(`http://${link}`, '_blank')
    }

    return (
      <Container style={{ maxWidth: '80%' }}>
        <Layout.Vertical spacing="medium">
          <Layout.Horizontal spacing="xxxsmall">
            {!isK8sRule && !isEcsRule && (
              <>
                <Text
                  style={{
                    alignSelf: 'center',
                    color: tableProps.row.original.disabled ? textColor.disable : 'inherit',
                    marginRight: 5
                  }}
                >
                  No. of instances:
                </Text>
                {!resourcesLoading && resources?.response ? (
                  <Link
                    href={getInstancesLink(tableProps.row.original, resources as AllResourcesOfAccountResponse)}
                    target="_blank"
                    style={{
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: tableProps.row.original.disabled ? textColor.disable : 'inherit',
                      marginRight: 5
                    }}
                    onClick={e => {
                      e.stopPropagation()
                    }}
                  >
                    {resources?.response?.length}
                  </Link>
                ) : (
                  <Icon name="spinner" size={12} color="blue500" style={{ marginRight: 5 }} />
                )}
              </>
            )}
            {!tableProps.row.original.disabled && !isEcsRule && (
              <>
                {data?.response?.['state'] != null ? (
                  getStateTag(data?.response?.['state'])
                ) : !healthLoading ? (
                  getStateTag('down')
                ) : (
                  <Icon name="spinner" size={12} color="blue500" />
                )}
              </>
            )}
          </Layout.Horizontal>
          <Layout.Horizontal spacing="small">
            <Text
              style={{
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: tableProps.row.original.disabled ? textColor.disable : '#0278D5',
                textDecoration: 'underline',
                cursor: isSubmittedRule ? 'not-allowed' : 'inherit'
              }}
              onClick={handleDomainClick}
            >
              {hasCustomDomains ? tableProps.row.original.custom_domains?.join(',') : tableProps.row.original.host_name}
            </Text>
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
    const { triggerToggle } = useToggleRuleState({
      orgIdentifier,
      projectIdentifier,
      accountId,
      serviceData: row.original,
      onSuccess: (updatedServiceData: Service) => onServiceStateToggle('SUCCESS', updatedServiceData, row.index),
      onFailure: err => onServiceStateToggle('FAILURE', err)
    })
    const { triggerDelete } = useDeleteServiceHook({
      orgIdentifier,
      projectIdentifier,
      serviceData: row.original,
      accountId,
      onSuccess: (_data: Service) => onServiceDeletion('SUCCESS', _data),
      onFailure: err => onServiceDeletion('FAILURE', err)
    })

    const handleToggleRuleClick = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      e.stopPropagation()
      triggerToggle()
    }

    const handleDeleteRuleClick = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      e.stopPropagation()
      triggerDelete()
    }

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
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(true)
            }}
            data-testid={`menu-${data}`}
          />
          <Menu style={{ minWidth: 'unset' }}>
            {row.original.disabled ? (
              <Menu.Item icon="play" text="Enable" onClick={handleToggleRuleClick} />
            ) : (
              <Menu.Item icon="disable" text="Disable" onClick={handleToggleRuleClick} />
            )}
            {row.original.status !== 'submitted' && (
              <Menu.Item
                icon="edit"
                text="Edit"
                onClick={() => handleServiceEdit(row.original)}
                // onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                //   e.stopPropagation()
                //   alert('you are editing')
                // }}
              />
            )}
            <Menu.Item icon="trash" text="Delete" onClick={handleDeleteRuleClick} />
          </Menu>
        </Popover>
      </Layout.Horizontal>
    )
  }

  const getActiveServicesCount = () => {
    return tableData.filter(service => !service.disabled).length
  }

  const onServiceStateToggle = (type: 'SUCCESS' | 'FAILURE', data: Service | any, index?: number) => {
    if (type === 'SUCCESS') {
      const currTableData: Service[] = [...tableData]
      currTableData.splice(index as number, 1, data)
      setTableData(currTableData)
      if (!_isEmpty(selectedService)) {
        setSelectedService({ data, index: index as number })
      }
      showSuccess(`Rule ${data.name} ${!data.disabled ? 'enabled' : 'disabled'}`)
    } else {
      showError(data, undefined, 'ce.svc.stage.toggle.error')
    }
  }

  const onServiceDeletion = (type: 'SUCCESS' | 'FAILURE', data: Service | any) => {
    if (type === 'SUCCESS') {
      showSuccess(`Rule ${data.name} deleted successfully`)
      if (isDrawerOpen) {
        setIsDrawerOpen(false)
        setSelectedService(null)
      }
      refetchServices()
    } else {
      showError(data, undefined, 'ce.svc.delete.error')
    }
  }

  const handleServiceEdit = (_service: Service) =>
    history.push(
      routes.toCECOEditGateway({
        accountId: _service.account_identifier as string,
        gatewayIdentifier: _service.id?.toString() as string
      })
    )

  const StatusCell = ({ row }: CellProps<Service>) => {
    const { data } = useGetServiceDiagnostics({
      account_id: accountId, // eslint-disable-line
      rule_id: row.original.id as number, // eslint-disable-line
      queryParams: {
        accountIdentifier: accountId
      }
    })
    const diagnosticsErrors = (data?.response || [])
      .filter(item => !item.success)
      .map(item => ({ action: item.name, error: item.message }))
    const hasError: boolean = !_isEmpty(row.original.metadata?.service_errors) || !_isEmpty(diagnosticsErrors)
    const combinedErrors: ServiceError[] = (row.original.metadata?.service_errors || []).concat(diagnosticsErrors)
    return (
      <TextWithToolTip
        messageText={row.original.status}
        errors={hasError ? combinedErrors : []}
        status={
          row.original.status === 'errored' || hasError ? textWithToolTipStatus.ERROR : textWithToolTipStatus.SUCCESS
        }
        indicatorColor={row.original.status === 'submitted' ? Color.YELLOW_500 : undefined}
      />
    )
  }

  return (
    <Container background={Color.WHITE} height="100vh">
      {!loading && _isEmpty(tableData) ? (
        <>
          <Breadcrumbs
            className={css.breadCrumb}
            links={[
              {
                url: routes.toCECORules({ accountId }),
                label: getString('ce.co.breadCrumb.rules')
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
            <img src={landingPageSVG} alt="autostopping-rules" width="500px"></img>
            <Text font="normal" style={{ lineHeight: '24px', textAlign: 'center', width: '760px', marginTop: '20px' }}>
              <String stringID="ce.co.landingPageText" useRichText={true} /> <Link href="/">Learn more</Link>
            </Text>
            <RbacButton
              intent="primary"
              text={getString('ce.co.newAutoStoppingRule')}
              icon="plus"
              featuresProps={{
                featuresRequest: {
                  featureNames: [FeatureIdentifier.RESTRICTED_AUTOSTOPPING_RULE_CREATION]
                },
                warningMessage: getString('ce.co.autoStoppingRule.limitWarningMessage', {
                  limit: featureDetail?.limit,
                  count: featureDetail?.count
                })
              }}
              onClick={() => {
                history.push(
                  routes.toCECOCreateGateway({
                    accountId
                  })
                )
                trackEvent(USER_JOURNEY_EVENTS.CREATE_NEW_AS_CLICK, {})
              }}
            />
          </Layout.Vertical>
        </>
      ) : (
        <>
          {
            <>
              <Layout.Horizontal
                flex={{ justifyContent: 'flex-start' }}
                className={css.header}
                padding={{ left: 'xlarge', right: 'xlarge' }}
              >
                <Heading data-tooltip-id="autostoppingRule" level={2} color={Color.GREY_800} font={{ weight: 'bold' }}>
                  {getString('ce.co.breadCrumb.rules')}
                </Heading>
                <HarnessDocTooltip tooltipId="autostoppingRule" useStandAlone={true} />
              </Layout.Horizontal>
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
                  setSelectedService(null)
                }}
                size="656px"
                style={{
                  boxShadow: '0px 2px 8px rgba(40, 41, 61, 0.04), 0px 16px 24px rgba(96, 97, 112, 0.16)',
                  borderRadius: '8px',
                  overflowY: 'scroll'
                }}
              >
                <COGatewayAnalytics
                  service={selectedService}
                  handleServiceToggle={onServiceStateToggle}
                  handleServiceDeletion={onServiceDeletion}
                  handleServiceEdit={handleServiceEdit}
                />
              </Drawer>
              <>
                <Layout.Horizontal padding="large">
                  <Layout.Horizontal width="55%">
                    <RbacButton
                      intent="primary"
                      text={getString('ce.co.newAutoStoppingRule')}
                      icon="plus"
                      featuresProps={{
                        featuresRequest: {
                          featureNames: [FeatureIdentifier.RESTRICTED_AUTOSTOPPING_RULE_CREATION]
                        },
                        warningMessage: getString('ce.co.autoStoppingRule.limitWarningMessage', {
                          limit: featureDetail?.limit,
                          count: featureDetail?.count
                        })
                      }}
                      onClick={() => {
                        history.push(
                          routes.toCECOCreateGateway({
                            accountId
                          })
                        )
                        trackEvent('StartedMakingAutoStoppingRule', {})
                      }}
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
                  activeServicesCount={getActiveServicesCount()}
                ></COGatewayCumulativeAnalytics>
                <div style={{ position: 'relative' }}>
                  <Layout.Horizontal className={css.refreshIconContainer} onClick={() => refetchServices()}>
                    <img src={refreshIcon} width={'12px'} height={'12px'} />
                    <Text>Refresh</Text>
                  </Layout.Horizontal>
                  {loading && !_isEmpty(tableData) ? (
                    <Layout.Horizontal
                      style={{ padding: 'var(--spacing-large)', paddingTop: 'var(--spacing-xxxlarge)' }}
                    >
                      <PageSpinner />
                    </Layout.Horizontal>
                  ) : (
                    <TableV2<Service>
                      data={tableData.slice(
                        pageIndex * TOTAL_ITEMS_PER_PAGE,
                        pageIndex * TOTAL_ITEMS_PER_PAGE + TOTAL_ITEMS_PER_PAGE
                      )}
                      className={css.table}
                      pagination={{
                        pageSize: TOTAL_ITEMS_PER_PAGE,
                        pageIndex: pageIndex,
                        pageCount: Math.ceil(tableData.length / TOTAL_ITEMS_PER_PAGE) ?? 1,
                        itemCount: tableData.length,
                        gotoPage: newPageIndex => setPageIndex(newPageIndex)
                      }}
                      onRowClick={(e, index) => {
                        setSelectedService({ data: e, index })
                        setIsDrawerOpen(true)
                      }}
                      columns={[
                        {
                          accessor: 'name',
                          Header: getString('ce.co.rulesTableHeaders.name'),
                          width: '18%',
                          Cell: NameCell,
                          disableSortBy: true
                        },
                        {
                          accessor: 'idle_time_mins',
                          Header: getString('ce.co.rulesTableHeaders.idleTime'),
                          width: '8%',
                          Cell: TimeCell,
                          disableSortBy: true
                        },
                        {
                          accessor: 'fulfilment',
                          Header: getString('ce.co.rulesTableHeaders.fulfilment'),
                          width: '12%',
                          Cell: IconCell,
                          disableSortBy: true
                        },
                        {
                          Header: getString('ce.co.rulesTableHeaders.mangedResources'),
                          width: '22%',
                          Cell: ResourcesCell
                        },
                        {
                          Header: getString('ce.co.rulesTableHeaders.savings'),
                          width: '15%',
                          Cell: SavingsCell,
                          disableSortBy: true
                        },
                        {
                          Header: getString('ce.co.rulesTableHeaders.lastActivity'),
                          width: '10%',
                          Cell: ActivityCell
                        },
                        {
                          Header: getString('ce.co.rulesTableHeaders.status'),
                          width: '10%',
                          Cell: StatusCell
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
                  )}
                </div>
              </Page.Body>
            </>
          }
        </>
      )}
    </Container>
  )
}

export default COGatewayList
