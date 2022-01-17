/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import type { CellProps } from 'react-table'
import cx from 'classnames'
import { isEmpty as _isEmpty, defaultTo as _defaultTo } from 'lodash-es'
import { Heading, Container, Layout, Text, Table, Color, Icon, IconName } from '@wings-software/uicore'
import type { ConnectionMetadata, GatewayDetails, InstanceDetails } from '@ce/components/COCreateGateway/models'
import { Utils } from '@ce/common/Utils'
import type { ContainerSvc, HealthCheck, PortConfig, RDSDatabase, Service } from 'services/lw'
import FixedSchedeulesList from '@ce/common/FixedSchedulesList/FixedSchedulesList'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import { getFulfilmentIcon } from '../COGatewayList/Utils'
import KubernetesRuleYamlEditor from '../COGatewayConfig/KubernetesRuleYamlEditor'
import { DisplaySelectedEcsService } from '../COGatewayConfig/steps/ManageResources/DisplaySelectedEcsService'
import { DisplaySelectedRdsDatabse } from '../COGatewayConfig/steps/ManageResources/DisplaySelectedRdsDatabase'
import css from './COGatewayReview.module.scss'

interface COGatewayReviewProps {
  gatewayDetails: GatewayDetails
  onEdit: (tabDetails: { id: string; metaData?: { activeStepCount?: number; activeStepTabId?: string } }) => void
  allServices: Service[]
}

interface DependencyView {
  name: string
  delay: number
}

function TableCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}
function PathCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value.length ? tableProps.value[0].path_match : ''}
    </Text>
  )
}
function NameCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK} style={{ overflowWrap: 'anywhere' }}>
      {tableProps.value} {tableProps.row.original.id}
    </Text>
  )
}

interface ReviewDetailsSectionProps {
  isEditable?: boolean
  onEdit?: () => void
}

const ReviewDetailsSection: React.FC<ReviewDetailsSectionProps> = props => {
  return (
    <Container className={css.reviewDetailsSection}>
      {props.isEditable && (
        <div className={css.editCta} onClick={props.onEdit}>
          <span>EDIT</span>
        </div>
      )}
      {props.children}
    </Container>
  )
}

const COGatewayReview: React.FC<COGatewayReviewProps> = props => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const isK8sRule = Utils.isK8sRule(props.gatewayDetails)
  const filteredSchedules = props.gatewayDetails.schedules?.filter(s => !s.isDeleted)
  const hasSelectedInstances = !_isEmpty(props.gatewayDetails.selectedInstances)
  const serviceIdToNameMap = useMemo(() => {
    const map: Record<number, string> = {}
    props.allServices?.forEach(s => {
      map[s.id as number] = s.name
    })
    return map
  }, [props.allServices])

  useEffect(() => {
    trackEvent(USER_JOURNEY_EVENTS.RULE_CREATION_STEP_3, {})
  }, [])

  const getViewDependencies = (): DependencyView[] => {
    const list = props.gatewayDetails.deps.map(d => ({
      name: _defaultTo(serviceIdToNameMap[d.dep_id as number], d.dep_id) as string,
      delay: d.delay_secs as number
    }))
    return _defaultTo(list, [])
  }

  return (
    <Layout.Vertical padding="large" className={css.page}>
      <Text className={css.reviewHeading}>Cloud account details</Text>
      <ReviewDetailsSection>
        <Layout.Horizontal spacing={'large'} className={css.equalSpacing}>
          <Text>Selected cloud account</Text>
          <Text>
            <Icon name={props.gatewayDetails.provider.icon as IconName} /> {props.gatewayDetails.cloudAccount.name}
          </Text>
        </Layout.Horizontal>
      </ReviewDetailsSection>
      <Text className={css.reviewHeading}>Configuration details</Text>
      <ReviewDetailsSection
        isEditable
        onEdit={() => props.onEdit({ id: 'configuration', metaData: { activeStepCount: 1 } })}
      >
        <Layout.Vertical>
          <Layout.Horizontal
            spacing={'large'}
            padding={{ bottom: 'medium' }}
            className={cx(css.equalSpacing, css.borderSpacing)}
          >
            <Text>Name of the rule</Text>
            <Text>{props.gatewayDetails.name}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal spacing={'large'} className={css.equalSpacing}>
            <Text>Idle time(mins)</Text>
            <Text>{props.gatewayDetails.idleTimeMins}</Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      </ReviewDetailsSection>
      {!isK8sRule && (
        <ReviewDetailsSection
          isEditable
          onEdit={() => props.onEdit({ id: 'configuration', metaData: { activeStepCount: 2 } })}
        >
          {hasSelectedInstances && (
            <>
              <Heading level={2}>Instance details</Heading>
              <Text style={{ margin: '20px 0 10px' }}>Instances</Text>
              <Table<InstanceDetails>
                data={props.gatewayDetails.selectedInstances}
                bpTableProps={{}}
                className={css.instanceTable}
                columns={[
                  {
                    accessor: 'name',
                    Header: 'NAME AND ID',
                    width: '16.5%',
                    Cell: NameCell
                  },
                  {
                    accessor: 'ipv4',
                    Header: 'IP ADDRESS',
                    width: '16.5%',
                    Cell: TableCell,
                    disableSortBy: true
                  },
                  {
                    accessor: 'region',
                    Header: 'REGION',
                    width: '16.5%',
                    Cell: TableCell
                  },
                  {
                    accessor: 'type',
                    Header: 'TYPE',
                    width: '16.5%',
                    Cell: TableCell
                  },
                  {
                    accessor: 'tags',
                    Header: 'TAGS',
                    width: '16.5%',
                    Cell: TableCell
                  },
                  {
                    accessor: 'launch_time',
                    Header: 'LAUNCH TIME',
                    width: '16.5%',
                    Cell: TableCell
                  },
                  {
                    accessor: 'status',
                    Header: 'STATUS',
                    width: '16.5%',
                    Cell: TableCell
                  }
                ]}
              />
            </>
          )}
          {!_isEmpty(props.gatewayDetails.routing.container_svc) && (
            <Layout.Vertical spacing="xxlarge">
              <Heading level={2}>Service details</Heading>
              <DisplaySelectedEcsService data={[props.gatewayDetails.resourceMeta?.container_svc as ContainerSvc]} />
              <Layout.Horizontal spacing={'large'} className={css.equalSpacing}>
                <Text>Desired Task Count</Text>
                <Text>{props.gatewayDetails.routing.container_svc?.task_count}</Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          )}
          {!_isEmpty(props.gatewayDetails.routing.database) && (
            <>
              <Heading level={2}>RDS details</Heading>
              <DisplaySelectedRdsDatabse data={[props.gatewayDetails.routing.database as RDSDatabase]} />
            </>
          )}
          {hasSelectedInstances && (
            <Layout.Horizontal spacing={'large'} className={css.equalSpacing} style={{ marginTop: 20 }}>
              <Text>Instance fulfilment</Text>
              <Layout.Horizontal spacing={'small'}>
                <img
                  className={css.fulFilmentIcon}
                  src={getFulfilmentIcon(props.gatewayDetails.fullfilment)}
                  alt=""
                  aria-hidden
                />
                <Text>{props.gatewayDetails.fullfilment || 'ondemand'}</Text>
              </Layout.Horizontal>
            </Layout.Horizontal>
          )}
        </ReviewDetailsSection>
      )}
      {props.gatewayDetails.opts && (
        <ReviewDetailsSection
          isEditable
          onEdit={() =>
            props.onEdit({ id: 'configuration', metaData: { activeStepCount: 4, activeStepTabId: 'advanced' } })
          }
        >
          <Heading level={2}>Advanced configuration</Heading>
          <Layout.Vertical style={{ marginTop: 'var(--spacing-large)' }}>
            {isK8sRule && (
              <Layout.Horizontal
                spacing={'large'}
                padding={{ bottom: 'medium' }}
                className={cx(css.equalSpacing, css.borderSpacing)}
              >
                <Text>Hide progress page</Text>
                <Text>{Utils.booleanToString(props.gatewayDetails.opts.hide_progress_page)}</Text>
              </Layout.Horizontal>
            )}
            {!_isEmpty(filteredSchedules) && (
              <Container padding={{ top: 'medium' }}>
                <Heading level={3}>
                  {getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.title')}
                </Heading>
                <FixedSchedeulesList data={_defaultTo(filteredSchedules, [])} isEditable={false} />
              </Container>
            )}
          </Layout.Vertical>
          {!_isEmpty(props.gatewayDetails.deps) && (
            <Table<DependencyView>
              data={getViewDependencies()}
              className={css.instanceTable}
              bpTableProps={{}}
              columns={[
                { accessor: 'name', Header: 'RULE', Cell: TableCell },
                { accessor: 'delay', Header: 'DELAY(SECS)', Cell: TableCell }
              ]}
            />
          )}
        </ReviewDetailsSection>
      )}
      {_isEmpty(props.gatewayDetails.routing.database) && (
        <Text className={css.reviewHeading}>Setup Access details</Text>
      )}
      {isK8sRule && (
        <Layout.Vertical style={{ marginTop: 20 }}>
          <KubernetesRuleYamlEditor
            existingData={JSON.parse(props.gatewayDetails.routing.k8s?.RuleJson || '{}')}
            mode={'read'}
          />
        </Layout.Vertical>
      )}

      {!isK8sRule && (
        <>
          {!_isEmpty(props.gatewayDetails.routing.ports) &&
            _isEmpty(props.gatewayDetails.routing.container_svc) &&
            _isEmpty(props.gatewayDetails.routing.database) && (
              <ReviewDetailsSection
                isEditable
                onEdit={() => props.onEdit({ id: 'setupAccess', metaData: { activeStepTabId: 'routing' } })}
              >
                <Heading level={2}>Routing</Heading>
                {!isK8sRule && (
                  <Table<PortConfig>
                    data={props.gatewayDetails.routing.ports}
                    className={css.instanceTable}
                    bpTableProps={{}}
                    columns={[
                      {
                        accessor: 'protocol',
                        Header: 'LISTEN PROTOCOL',
                        width: '16.5%',
                        Cell: TableCell
                      },
                      {
                        accessor: 'port',
                        Header: 'LISTEN PORT',
                        width: '16.5%',
                        Cell: TableCell,
                        disableSortBy: true
                      },
                      {
                        accessor: 'action',
                        Header: 'ACTION',
                        width: '16.5%',
                        Cell: TableCell
                      },
                      {
                        accessor: 'target_protocol',
                        Header: 'TARGET PROTOCOL',
                        width: '16.5%',
                        Cell: TableCell
                      },
                      {
                        accessor: 'target_port',
                        Header: 'TARGET PORT',
                        width: '16.5%',
                        Cell: TableCell
                      },
                      {
                        accessor: 'redirect_url',
                        Header: 'REDIRECT URL',
                        width: '16.5%',
                        Cell: TableCell
                      },
                      {
                        accessor: 'server_name',
                        Header: 'SERVER NAME',
                        width: '16.5%',
                        Cell: TableCell
                      },
                      {
                        accessor: 'routing_rules',
                        Header: 'PATH MATCH',
                        width: '16.5%',
                        Cell: PathCell
                      }
                    ]}
                  />
                )}
              </ReviewDetailsSection>
            )}
          {props.gatewayDetails.opts.access_details?.dnsLink?.selected &&
            !_isEmpty(props.gatewayDetails.healthCheck) &&
            _isEmpty(props.gatewayDetails.routing.container_svc) &&
            _isEmpty(props.gatewayDetails.routing.database) && (
              <ReviewDetailsSection
                isEditable
                onEdit={() => props.onEdit({ id: 'setupAccess', metaData: { activeStepTabId: 'healthcheck' } })}
              >
                <Heading level={2}>Health Check</Heading>
                <Table<HealthCheck>
                  data={[props.gatewayDetails.healthCheck as HealthCheck]}
                  className={css.instanceTable}
                  bpTableProps={{}}
                  columns={[
                    {
                      accessor: 'protocol',
                      Header: 'PROTOCOL',
                      width: '20%',
                      Cell: TableCell
                    },
                    {
                      accessor: 'path',
                      Header: 'PATH',
                      width: '20%',
                      Cell: TableCell
                    },
                    {
                      accessor: 'port',
                      Header: 'PORT',
                      width: '20%',
                      Cell: TableCell,
                      disableSortBy: true
                    },
                    {
                      accessor: 'timeout',
                      Header: 'TIMEOUT(SECS)',
                      width: '20%',
                      Cell: TableCell,
                      disableSortBy: true
                    },
                    {
                      accessor: 'status_code_from',
                      Header: 'STATUS',
                      width: '20%',
                      Cell: tableProps => (
                        <Text lineClamp={3} color={Color.BLACK}>
                          {`${tableProps.row.original.status_code_from}-${tableProps.row.original.status_code_to}`}
                        </Text>
                      )
                    }
                  ]}
                />
              </ReviewDetailsSection>
            )}
          {_isEmpty(props.gatewayDetails.routing.database) && (
            <ReviewDetailsSection isEditable onEdit={() => props.onEdit({ id: 'setupAccess' })}>
              <Heading level={2}>DNS Link mapping</Heading>
              <Layout.Vertical style={{ marginTop: 'var(--spacing-large)' }}>
                {!_isEmpty(props.gatewayDetails.customDomains) && (
                  <Layout.Horizontal
                    spacing={'large'}
                    padding={{ bottom: 'medium' }}
                    className={cx(css.equalSpacing, css.borderSpacing)}
                  >
                    <Text>Custom domain</Text>
                    <Text>{props.gatewayDetails.customDomains?.join(',')}</Text>
                  </Layout.Horizontal>
                )}
                {_isEmpty(props.gatewayDetails.routing.container_svc) &&
                  _isEmpty(props.gatewayDetails.routing.database) && (
                    <Layout.Horizontal
                      spacing={'large'}
                      padding={{ bottom: 'medium' }}
                      className={cx(css.equalSpacing, css.borderSpacing)}
                    >
                      <Text>Is it publicly accessible?</Text>
                      <Text>
                        {(props.gatewayDetails.opts.access_details as ConnectionMetadata).dnsLink.public || 'Yes'}
                      </Text>
                    </Layout.Horizontal>
                  )}
                {_isEmpty(props.gatewayDetails.customDomains) && props.gatewayDetails.hostName && (
                  <Layout.Horizontal
                    spacing={'large'}
                    padding={{ bottom: 'medium' }}
                    className={cx(css.equalSpacing, css.borderSpacing)}
                  >
                    <Text>Auto generated URL</Text>
                    <Text>{props.gatewayDetails.hostName}</Text>
                  </Layout.Horizontal>
                )}
                {/* <Layout.Horizontal
            spacing={'large'}
            padding={{ bottom: 'medium' }}
            className={cx(css.equalSpacing, css.borderSpacing)}
          >
            <Text>Access point mapping status</Text>
            <Text>{Utils.booleanToString(props.gatewayDetails.matchAllSubdomains as boolean)}</Text>
          </Layout.Horizontal>
          <Layout.Horizontal
            spacing={'large'}
            padding={{ bottom: 'medium' }}
            className={cx(css.equalSpacing, css.borderSpacing)}
          >
            <Text>Custom Domain mapping status</Text>
            <Text>{Utils.booleanToString(props.gatewayDetails.matchAllSubdomains as boolean)}</Text>
          </Layout.Horizontal> */}
              </Layout.Vertical>
            </ReviewDetailsSection>
          )}
        </>
      )}
    </Layout.Vertical>
  )
}

export default COGatewayReview
