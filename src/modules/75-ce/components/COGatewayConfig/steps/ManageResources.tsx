import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty as _isEmpty, omit as _omit } from 'lodash-es'
import type { CellProps, Renderer } from 'react-table'
import ReactTimeago from 'react-timeago'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { Button, Color, Icon, Layout, Table, Text, useModalHook } from '@wings-software/uicore'
import { String, StringKeys, useStrings } from 'framework/strings'
import { CONFIG_STEP_IDS, CONFIG_TOTAL_STEP_COUNTS, DEFAULT_ACCESS_DETAILS, RESOURCES } from '@ce/constants'
import { FeatureFlag } from '@common/featureFlags'
import type { GatewayDetails, InstanceDetails } from '@ce/components/COCreateGateway/models'
import COK8sClusterSelector from '@ce/components/COK8sClusterSelector/COK8sClusterSelector'
import { ConnectorInfoDTO, ConnectorResponse, useGetConnectorListV2 } from 'services/cd-ng'
import { ASGMinimal, PortConfig, useAllResourcesOfAccount, useGetAllASGs } from 'services/lw'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import COInstanceSelector from '@ce/components/COInstanceSelector/COInstanceSelector'
import COAsgSelector from '@ce/components/COAsgSelector'
import { Connectors } from '@connectors/constants'
import { TagsPopover } from '@common/components'
import { DelegateTypes } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { Utils } from '@ce/common/Utils'
import COGatewayConfigStep from '../COGatewayConfigStep'
import { fromResourceToInstanceDetails, isFFEnabledForResource } from '../helper'
import ResourceSelectionModal from '../ResourceSelectionModal'
import css from '../COGatewayConfig.module.scss'

interface ManageResourcesProps {
  setDrawerOpen: (shouldOpen: boolean) => void
  totalStepsCount: number
  gatewayDetails: GatewayDetails
  setGatewayDetails: (details: GatewayDetails) => void
  setTotalStepsCount: (stepCount: number) => void
  selectedResource: RESOURCES | null
  setSelectedResource: (resource: RESOURCES) => void
}

const managedResources = [
  { label: 'EC2 VM(s)', value: RESOURCES.INSTANCES, providers: ['aws'] },
  { label: 'VM(s)', value: RESOURCES.INSTANCES, providers: ['azure'] },
  { label: 'Auto scaling groups', value: RESOURCES.ASG, providers: ['aws'] },
  {
    label: 'Kubernetes Cluster',
    value: RESOURCES.KUBERNETES,
    providers: ['aws', 'azure', 'gcp'],
    ffDependencies: ['CE_AS_KUBERNETES_ENABLED']
  }
]

const TableCell = (tableProps: CellProps<InstanceDetails>): JSX.Element => {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}
const NameCell = (tableProps: CellProps<InstanceDetails>): JSX.Element => {
  return (
    <Text lineClamp={3} color={Color.BLACK} style={{ overflowWrap: 'anywhere' }}>
      {tableProps.value} {tableProps.row.original.id}
    </Text>
  )
}

const ManageResources: React.FC<ManageResourcesProps> = props => {
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()
  const { showError } = useToaster()

  const [allConnectors, setAllConnectors] = useState<ConnectorResponse[]>([])
  const [connectorsToShow, setConnectorsToShow] = useState<ConnectorResponse[]>([])
  const [asgToShow, setAsgToShow] = useState<ASGMinimal[]>([])
  const [allAsg, setAllAsg] = useState<ASGMinimal[]>([])
  const [selectedAsg, setSelectedAsg] = useState<ASGMinimal | undefined>(
    props.gatewayDetails.routing?.instance?.scale_group
  )
  const [filteredInstances, setFilteredInstances] = useState<InstanceDetails[]>([])
  const [allInstances, setAllInstances] = useState<InstanceDetails[]>([])
  const [selectedInstances, setSelectedInstances] = useState<InstanceDetails[]>(props.gatewayDetails.selectedInstances)
  const [selectedConnector, setSelectedConnector] = useState<ConnectorResponse | undefined>()

  const isKubernetesEnabled = useFeatureFlag(FeatureFlag.CE_AS_KUBERNETES_ENABLED)
  const isAzureProvider = Utils.isProviderAzure(props.gatewayDetails.provider)
  const [featureFlagsMap] = useState<Record<string, boolean>>({ CE_AS_KUBERNETES_ENABLED: isKubernetesEnabled })

  const { mutate: getInstances, loading: loadingInstances } = useAllResourcesOfAccount({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      type: 'instance',
      accountIdentifier: accountId
    }
  })

  const { mutate: fetchAllASGs, loading: loadingFetchASGs } = useGetAllASGs({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      accountIdentifier: accountId
    }
  })

  const { mutate: fetchConnectors, loading: loadingConnectors } = useGetConnectorListV2({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm: '',
      pageIndex: 0,
      pageSize: 100
    }
  })

  useEffect(() => {
    if (!props.gatewayDetails.provider) {
      return
    }
    const resourcesFetchMap = {
      [RESOURCES.INSTANCES]: refreshInstances,
      [RESOURCES.ASG]: fetchAndSetAsgItems,
      [RESOURCES.KUBERNETES]: fetchAndSetConnectors
    }
    if (props.selectedResource) {
      resourcesFetchMap[props.selectedResource]?.()
    }
  }, [props.gatewayDetails.provider, props.selectedResource])

  useEffect(() => {
    // run only in case of selecting instances
    if (props.selectedResource === RESOURCES.INSTANCES && !selectedInstances.length) {
      setRoutingRecords([])
    }
  }, [selectedInstances])

  useEffect(() => {
    clearResourceDetailsFromGateway(props.selectedResource as RESOURCES)
  }, [props.selectedResource])

  const resetSelectedInstancesDetails = () => {
    if (!_isEmpty(props.gatewayDetails.selectedInstances)) {
      setRoutingRecords([])
      setSelectedInstances([])
      const updatedGatewayDetails = {
        ...props.gatewayDetails,
        metadata: { ...props.gatewayDetails.metadata, access_details: DEFAULT_ACCESS_DETAILS },
        selectedInstances: []
      }
      props.setGatewayDetails(updatedGatewayDetails)
    }
  }

  const resetSelectedAsgDetails = () => {
    if (!_isEmpty(props.gatewayDetails.routing.instance.scale_group)) {
      setRoutingRecords([])
      setSelectedAsg(undefined)
      const updatedGatewayDetails = {
        ...props.gatewayDetails,
        metadata: { ...props.gatewayDetails.metadata, access_details: DEFAULT_ACCESS_DETAILS }
      }
      delete updatedGatewayDetails.routing.instance.scale_group
      props.setGatewayDetails(updatedGatewayDetails)
    }
  }

  const clearResourceDetailsFromGateway = (resourceType: RESOURCES) => {
    if (resourceType === RESOURCES.INSTANCES) {
      // set total no. of steps to default (4)
      props.setTotalStepsCount(CONFIG_TOTAL_STEP_COUNTS.DEFAULT)
      // remove details related to AsG
      resetSelectedAsgDetails()
      resetKubernetesConnectorDetails()
    } else if (resourceType === RESOURCES.ASG) {
      // set total no. of steps to default (4)
      props.setTotalStepsCount(CONFIG_TOTAL_STEP_COUNTS.DEFAULT)
      // remove details related to instances
      resetSelectedInstancesDetails()

      resetKubernetesConnectorDetails()
    } else if (resourceType === RESOURCES.KUBERNETES) {
      // set total no. of steps to modified (3)
      props.setTotalStepsCount(CONFIG_TOTAL_STEP_COUNTS.MODIFIED)
      resetSelectedInstancesDetails()
      resetSelectedAsgDetails()
    }
  }

  const resetKubernetesConnectorDetails = () => {
    if (!_isEmpty(props.gatewayDetails.metadata.kubernetes_connector_id)) {
      setSelectedConnector(undefined)
      const updatedRouting = _omit(props.gatewayDetails.routing, 'k8s')
      const updatedMetadata = _omit(props.gatewayDetails.metadata, 'kubernetes_connector_id')
      const updatedGatewayDetails: GatewayDetails = {
        ...props.gatewayDetails,
        routing: updatedRouting,
        metadata: updatedMetadata
      }
      props.setGatewayDetails(updatedGatewayDetails)
    }
  }

  const refreshInstances = async (): Promise<void> => {
    try {
      const result = await getInstances(
        { Text: '' },
        {
          queryParams: {
            cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
            type: 'instance',
            accountIdentifier: accountId
          }
        }
      )
      const instances =
        result?.response
          ?.filter(x => x.status !== 'terminated')
          .map(item => fromResourceToInstanceDetails(item, isAzureProvider)) || []
      setAllInstances(instances)
      setFilteredInstances(instances)
    } catch (e) {
      showError(e.data?.message || e.message, undefined, 'ce.refetch.instance.error')
    }
  }

  const fetchAndSetAsgItems = async (): Promise<void> => {
    try {
      const result = await fetchAllASGs({ Text: '' })
      if (result?.response) {
        const filteredAsgs = result.response.filter((item: ASGMinimal) => !_isEmpty(item.target_groups))
        setAllAsg(filteredAsgs)
        setAsgToShow(filteredAsgs)
      }
    } catch (err) {
      showError(err.data?.message || err.message, undefined, 'ce.fetchAndSetAsgItems.error')
    }
  }

  const fetchAndSetConnectors = async () => {
    try {
      const { data: connectorResponse } = await fetchConnectors({
        filterType: 'Connector',
        types: [Connectors.CE_KUBERNETES]
      })
      const content = connectorResponse?.content
      if (!_isEmpty(content)) {
        setAllConnectors(content as ConnectorResponse[])
        setConnectorsToShow(content as ConnectorResponse[])
        const prevSelectedConnector = (content as ConnectorResponse[]).find(
          _item => _item.connector?.identifier === props.gatewayDetails.metadata.kubernetes_connector_id
        )
        prevSelectedConnector && setSelectedConnector(prevSelectedConnector)
      }
    } catch (e) {
      showError(e.data?.message || e.message)
    }
  }

  const [openClusterModal, closeClusterModal] = useModalHook(() => {
    return (
      <ResourceSelectionModal
        closeBtnTestId={'close-connector-modal'}
        onClose={() => {
          handleConnectorsSearch('')
          closeClusterModal()
        }}
      >
        <COK8sClusterSelector
          loading={loadingConnectors}
          clusters={connectorsToShow}
          search={handleConnectorsSearch}
          selectedCluster={selectedConnector}
          refetchConnectors={fetchAndSetConnectors}
          onClusterAddSuccess={cluster => {
            const updatedGatewayDetails: GatewayDetails = {
              ...props.gatewayDetails,
              metadata: { ...props.gatewayDetails.metadata, kubernetes_connector_id: cluster.connector?.identifier }
            }
            props.setGatewayDetails(updatedGatewayDetails)
            setSelectedConnector(cluster)
            handleConnectorsSearch('')
            closeClusterModal()
          }}
        />
      </ResourceSelectionModal>
    )
  }, [allConnectors, connectorsToShow, selectedConnector, loadingConnectors, props.gatewayDetails])

  const [openAsgModal, closeAsgModal] = useModalHook(() => {
    return (
      <ResourceSelectionModal
        closeBtnTestId={'close-asg-modal'}
        onClose={() => {
          handleAsgSearch('')
          closeAsgModal()
        }}
      >
        <COAsgSelector
          selectedScalingGroup={selectedAsg}
          setSelectedAsg={setSelectedAsg}
          scalingGroups={asgToShow}
          gatewayDetails={props.gatewayDetails}
          search={handleAsgSearch}
          onAsgAddSuccess={updatedGatewayDetails => {
            props.setGatewayDetails(updatedGatewayDetails)
            handleAsgSearch('')
            closeAsgModal()
          }}
          loading={loadingFetchASGs}
          refresh={fetchAndSetAsgItems}
        />
      </ResourceSelectionModal>
    )
  }, [allAsg, asgToShow, selectedAsg, loadingFetchASGs, props.gatewayDetails])

  const [openInstancesModal, closeInstancesModal] = useModalHook(() => {
    return (
      <ResourceSelectionModal
        closeBtnTestId={'close-instance-modal'}
        onClose={() => {
          handleSearch('')
          closeInstancesModal()
        }}
      >
        <COInstanceSelector
          selectedInstances={selectedInstances}
          setSelectedInstances={setSelectedInstances}
          setGatewayDetails={props.setGatewayDetails}
          instances={filteredInstances}
          gatewayDetails={props.gatewayDetails}
          search={handleSearch}
          onInstancesAddSuccess={() => {
            handleSearch('')
            closeInstancesModal()
          }}
          loading={loadingInstances}
          refresh={refreshInstances}
        />
      </ResourceSelectionModal>
    )
  }, [filteredInstances, selectedInstances, loadingInstances, props.gatewayDetails])

  const handleAsgSearch = (text: string) => {
    if (!text) {
      setAsgToShow(allAsg)
      return
    }
    text = text.toLowerCase()
    const filteredScalingGroups = allAsg.filter(
      item => item.name?.toLowerCase().includes(text) || item.id?.toLowerCase().includes(text)
    )
    setAsgToShow(filteredScalingGroups)
  }

  const handleConnectorsSearch = (text: string) => {
    if (!text) {
      setConnectorsToShow(allConnectors)
      return
    }
    text = text.toLowerCase()
    const filteredConnectors = allConnectors.filter(item =>
      (item.connector as ConnectorInfoDTO).name?.toLowerCase().includes(text)
    )
    setConnectorsToShow(filteredConnectors)
  }

  const setRoutingRecords = (records: PortConfig[]) => {
    props.setGatewayDetails({ ...props.gatewayDetails, routing: { ...props.gatewayDetails.routing, ports: records } })
  }

  const openSelectedResourceModal = () => {
    const resource = props.selectedResource?.valueOf()
    const modalCbMap: Record<string, () => void> = {
      [RESOURCES.INSTANCES]: openInstancesModal,
      [RESOURCES.ASG]: openAsgModal,
      [RESOURCES.KUBERNETES]: openClusterModal
    }
    if (resource) {
      modalCbMap[resource]?.()
    }
  }

  const handleSearch = (text: string): void => {
    if (!text) {
      setFilteredInstances(allInstances)
      return
    }
    text = text.toLowerCase()
    const instances: InstanceDetails[] = []
    allInstances.forEach(t => {
      if (t.name.toLowerCase().indexOf(text) >= 0 || t.id.toLowerCase().indexOf(text) >= 0) {
        instances.push(t)
      }
    })
    setFilteredInstances(instances)
  }

  const handleDeletion = (rowIndex: number) => {
    const instances = [...selectedInstances]
    instances.splice(rowIndex, 1)
    if (instances.length) {
      const updatedGatewayDetails = { ...props.gatewayDetails }
      updatedGatewayDetails.selectedInstances = instances
      props.setGatewayDetails(updatedGatewayDetails)
      setSelectedInstances(instances)
    } else {
      resetSelectedInstancesDetails()
    }
  }

  return (
    <COGatewayConfigStep
      count={2}
      title={getString('ce.co.autoStoppingRule.configuration.step2.title')}
      onInfoIconClick={() => props.setDrawerOpen(true)}
      subTitle={getString('ce.co.autoStoppingRule.configuration.step2.subTitle')}
      totalStepsCount={props.totalStepsCount}
      id={CONFIG_STEP_IDS[1]}
    >
      <Layout.Vertical className={css.step2Container}>
        <Text className={css.radioGroupTitle}>Select the resources to be managed by the rule</Text>
        <RadioGroup
          selectedValue={props.selectedResource?.valueOf()}
          onChange={e => {
            props.setSelectedResource(e.currentTarget.value as RESOURCES)
          }}
          className={css.radioGroup}
        >
          {managedResources
            .filter(
              resource =>
                resource.providers.includes(props.gatewayDetails.provider.value) &&
                isFFEnabledForResource(resource.ffDependencies, featureFlagsMap)
            )
            .map(resourceItem => {
              return <Radio key={resourceItem.value} label={resourceItem.label} value={resourceItem.value} />
            })}
        </RadioGroup>
        <DisplayResourceInfo
          selectedResource={props.selectedResource as RESOURCES}
          onCtaClick={openSelectedResourceModal}
        />
        {!_isEmpty(selectedInstances) && (
          <DisplaySelectedInstances data={selectedInstances} onDelete={handleDeletion} />
        )}
        {!_isEmpty(selectedAsg) && <DisplaySelectedASG data={[selectedAsg as ASGMinimal]} />}
        {!_isEmpty(selectedConnector) && <DisplaySelectedConnector data={[selectedConnector as ConnectorResponse]} />}
      </Layout.Vertical>
    </COGatewayConfigStep>
  )
}

interface DisplayResourceInfoProps {
  selectedResource: RESOURCES
  onCtaClick: () => void
}

const DisplayResourceInfo: React.FC<DisplayResourceInfoProps> = props => {
  const { getString } = useStrings()

  const getSelectedResourceText = (resource: string) => {
    const textMap: Record<string, string> = {
      [RESOURCES.INSTANCES]: getString('ce.co.autoStoppingRule.configuration.step2.additionalResourceInfo.instance'),
      [RESOURCES.ASG]: getString('ce.co.autoStoppingRule.configuration.step2.additionalResourceInfo.asg'),
      [RESOURCES.KUBERNETES]: getString('ce.co.autoStoppingRule.configuration.step2.additionalResourceInfo.kubernetes')
    }
    return textMap[resource]
  }

  const getSelectedResourceModalCta = (resource: string) => {
    const textMap: Record<string, string> = {
      [RESOURCES.INSTANCES]: `+ ${getString('ce.co.autoStoppingRule.configuration.step2.addResourceCta.instance')}`,
      [RESOURCES.ASG]: `+ ${getString('ce.co.autoStoppingRule.configuration.step2.addResourceCta.asg')}`,
      [RESOURCES.KUBERNETES]: `+ ${getString('ce.co.autoStoppingRule.configuration.step2.addResourceCta.kubernetes')}`
    }
    return textMap[resource]
  }

  if (_isEmpty(props.selectedResource)) {
    return null
  }
  return (
    <Layout.Vertical style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14, color: '#9293AB', marginBottom: 10 }}>
        {getSelectedResourceText(props.selectedResource?.valueOf() as string)}
      </Text>
      <Text style={{ cursor: 'pointer', color: '#0278D5' }} onClick={props.onCtaClick}>
        {getSelectedResourceModalCta(props.selectedResource?.valueOf() as string)}
      </Text>
    </Layout.Vertical>
  )
}

interface DisplaySelectedInstancesProps {
  data: InstanceDetails[]
  onDelete: (index: number) => void
}

const DisplaySelectedInstances: React.FC<DisplaySelectedInstancesProps> = props => {
  const RemoveCell = (tableProps: CellProps<InstanceDetails>) => {
    return <Button className={css.clearBtn} icon={'delete'} onClick={() => props.onDelete(tableProps.row.index)} />
  }
  return (
    <Table<InstanceDetails>
      data={props.data}
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
        },
        {
          Header: '',
          id: 'menu',
          accessor: row => row.id,
          width: '5%',
          Cell: RemoveCell,
          disableSortBy: true
        }
      ]}
    />
  )
}

interface DisplaySelectedASGProps {
  data: ASGMinimal[]
}

const DisplaySelectedASG: React.FC<DisplaySelectedASGProps> = props => {
  return (
    <Table<ASGMinimal>
      data={props.data}
      bpTableProps={{}}
      columns={[
        {
          accessor: 'name',
          Header: 'Name and ID',
          width: '16.5%',
          Cell: NameCell
        },
        {
          accessor: 'desired',
          Header: 'Instances',
          width: '10%',
          Cell: TableCell,
          disableSortBy: true
        },
        {
          accessor: 'region',
          Header: 'Region',
          width: '16.5%',
          Cell: TableCell
        }
      ]}
    />
  )
}

interface DisplaySelectedConnectorProps {
  data: ConnectorResponse[]
}

const DisplaySelectedConnector: React.FC<DisplaySelectedConnectorProps> = props => {
  const { getString } = useStrings()

  const getConnectorDisplaySummaryLabel = (titleStringId: StringKeys, Element: JSX.Element): JSX.Element | string => {
    return (
      <div>
        {titleStringId ? (
          <Text inline color={Color.BLACK}>
            <String stringID={titleStringId} />:
          </Text>
        ) : null}
        {Element}
      </div>
    )
  }

  const displayDelegatesTagsSummary = (delegateSelectors: []): JSX.Element => {
    return (
      <div>
        <Text inline color={Color.BLACK}>
          <String stringID={'delegate.delegateTags'} />:
        </Text>
        <Text inline margin={{ left: 'xsmall' }} color={Color.GREY_400}>
          {delegateSelectors?.join?.(', ')}
        </Text>
      </div>
    )
  }

  const getK8DisplaySummary = (connector: ConnectorInfoDTO): JSX.Element | string => {
    return connector?.spec?.credential?.type === DelegateTypes.DELEGATE_IN_CLUSTER
      ? displayDelegatesTagsSummary(connector.spec.delegateSelectors)
      : getConnectorDisplaySummaryLabel('UrlLabel', <Text>{connector?.spec?.credential?.spec?.masterUrl}</Text>)
  }

  const RenderColumnConnector: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
    const data = row.original
    const tags = data.connector?.tags || {}
    return (
      <Layout.Horizontal spacing="small">
        <div>
          <Layout.Horizontal spacing="small">
            <div color={Color.BLACK} title={data.connector?.name}>
              {data.connector?.name}
            </div>
            {tags && Object.keys(tags).length ? <TagsPopover tags={tags} /> : null}
          </Layout.Horizontal>
          <div title={data.connector?.identifier}>{data.connector?.identifier}</div>
        </div>
      </Layout.Horizontal>
    )
  }

  const RenderColumnDetails: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
    const data = row.original

    return data.connector ? (
      <div>
        <div color={Color.BLACK}>{getK8DisplaySummary(data.connector)}</div>
      </div>
    ) : null
  }

  const RenderColumnActivity: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
    const data = row.original
    return (
      <Layout.Horizontal spacing="small">
        <Icon name="activity" />
        {data.activityDetails?.lastActivityTime ? <ReactTimeago date={data.activityDetails?.lastActivityTime} /> : null}
      </Layout.Horizontal>
    )
  }
  const RenderColumnLastUpdated: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
    const data = row.original
    return (
      <Layout.Horizontal spacing="small">
        {data.lastModifiedAt ? <ReactTimeago date={data.lastModifiedAt} /> : null}
      </Layout.Horizontal>
    )
  }
  return (
    <Table<ConnectorResponse>
      data={props.data}
      bpTableProps={{}}
      columns={[
        {
          Header: getString('connector').toUpperCase(),
          accessor: row => row.connector?.name,
          id: 'name',
          width: '20%',
          Cell: RenderColumnConnector
        },
        {
          Header: getString('details').toUpperCase(),
          accessor: row => row.connector?.description,
          id: 'details',
          width: '20%',
          Cell: RenderColumnDetails
        },
        {
          Header: getString('lastActivity').toUpperCase(),
          accessor: 'activityDetails',
          id: 'activity',
          width: '20%',
          Cell: RenderColumnActivity
        },
        {
          Header: getString('lastUpdated').toUpperCase(),
          accessor: 'lastModifiedAt',
          id: 'lastModifiedAt',
          width: '20%',
          Cell: RenderColumnLastUpdated
        }
      ]}
    />
  )
}

export default ManageResources
