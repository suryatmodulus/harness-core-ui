import React from 'react'
import type { CellProps } from 'react-table'
import cx from 'classnames'
import { isEmpty as _isEmpty } from 'lodash-es'
import { Heading, Container, Layout, Text, Table, Color, Icon, IconName } from '@wings-software/uicore'
import type { ConnectionMetadata, GatewayDetails, InstanceDetails } from '@ce/components/COCreateGateway/models'
import { Utils } from '@ce/common/Utils'
import type { HealthCheck, PortConfig, ServiceDep } from 'services/lw'
import { getFulfilmentIcon } from '../COGatewayList/Utils'
import KubernetesRuleYamlEditor from '../COGatewayConfig/KubernetesRuleYamlEditor'
import css from './COGatewayReview.module.scss'

interface COGatewayReviewProps {
  gatewayDetails: GatewayDetails
  onEdit: (tabDetails: { id: string; metaData?: { activeStepCount?: number; activeStepTabId?: string } }) => void
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
  const isK8sRule = !_isEmpty(props.gatewayDetails.routing.k8s?.RuleJson)
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
          <Heading level={2}>Instance details</Heading>
          {!!props.gatewayDetails.selectedInstances.length && (
            <>
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
          <Layout.Horizontal spacing={'large'} className={css.equalSpacing} style={{ marginTop: 20 }}>
            <Text>Instance fulfilment</Text>
            <Layout.Horizontal spacing={'small'}>
              <img
                className={css.fulFilmentIcon}
                src={getFulfilmentIcon(props.gatewayDetails.fullfilment)}
                alt=""
                aria-hidden
              />
              <Text>{props.gatewayDetails.fullfilment}</Text>
            </Layout.Horizontal>
          </Layout.Horizontal>
        </ReviewDetailsSection>
      )}
      {props.gatewayDetails.routing && (
        <ReviewDetailsSection
          isEditable
          onEdit={() =>
            props.onEdit({ id: 'configuration', metaData: { activeStepCount: 4, activeStepTabId: 'routing' } })
          }
        >
          <Heading level={2}>Routing</Heading>
          {isK8sRule && (
            <Layout.Vertical style={{ marginTop: 20 }}>
              <KubernetesRuleYamlEditor
                existingData={JSON.parse(props.gatewayDetails.routing.k8s?.RuleJson || '{}')}
                mode={'read'}
              />
            </Layout.Vertical>
          )}
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
      {!_isEmpty(props.gatewayDetails.healthCheck) && !isK8sRule && (
        <ReviewDetailsSection
          isEditable
          onEdit={() =>
            props.onEdit({ id: 'configuration', metaData: { activeStepCount: 4, activeStepTabId: 'healthcheck' } })
          }
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
                width: '25%',
                Cell: TableCell
              },
              {
                accessor: 'path',
                Header: 'PATH',
                width: '25%',
                Cell: TableCell
              },
              {
                accessor: 'port',
                Header: 'PORT',
                width: '25%',
                Cell: TableCell,
                disableSortBy: true
              },
              {
                accessor: 'timeout',
                Header: 'TIMEOUT(SECS)',
                width: '25%',
                Cell: TableCell,
                disableSortBy: true
              }
            ]}
          />
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
            <Layout.Horizontal
              spacing={'large'}
              padding={{ bottom: 'medium' }}
              className={cx(css.equalSpacing, css.borderSpacing)}
            >
              <Text>Allow traffic from all subdomains</Text>
              <Text>{Utils.booleanToString(props.gatewayDetails.matchAllSubdomains as boolean)}</Text>
            </Layout.Horizontal>
            <Layout.Horizontal spacing={'large'} className={css.equalSpacing}>
              <Text>Use private IP</Text>
              <Text>{Utils.booleanToString(props.gatewayDetails.opts.alwaysUsePrivateIP as boolean)}</Text>
            </Layout.Horizontal>
          </Layout.Vertical>
          {props.gatewayDetails.deps.length > 0 && (
            <Table<ServiceDep>
              data={props.gatewayDetails.deps}
              className={css.instanceTable}
              bpTableProps={{}}
              columns={[
                { accessor: 'dep_id', Header: 'RULE', Cell: TableCell },
                { accessor: 'delay_secs', Header: 'DELAY(SECS)', Cell: TableCell }
              ]}
            />
          )}
        </ReviewDetailsSection>
      )}
      {!isK8sRule && <Text className={css.reviewHeading}>Setup Access details</Text>}
      {!isK8sRule && (
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
            <Layout.Horizontal
              spacing={'large'}
              padding={{ bottom: 'medium' }}
              className={cx(css.equalSpacing, css.borderSpacing)}
            >
              <Text>Is it publicly accessible?</Text>
              <Text>
                {(props.gatewayDetails.metadata.access_details as ConnectionMetadata).dnsLink.public || 'Yes'}
              </Text>
            </Layout.Horizontal>
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
    </Layout.Vertical>
  )
}

export default COGatewayReview
