/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty as _isEmpty, defaultTo as _defaultTo } from 'lodash-es'
import {
  Button,
  Color,
  Container,
  ExpandingSearchInput,
  Icon,
  Layout,
  Select,
  Text,
  Radio,
  ButtonVariation,
  useToaster,
  TableV2
} from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import type { SelectOption } from '@wings-software/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  ContainerClusterMinimal,
  Region,
  useAllRegions,
  useGetContainerClustersOfRegion,
  useListOfServicesInContainerServiceCluster,
  ContainerServiceServiceMinimal,
  useDescribeServiceInContainerServiceCluster
} from 'services/lw'
import { useStrings } from 'framework/strings'
import type { GatewayDetails } from '../COCreateGateway/models'

interface COEcsSelectorProps {
  gatewayDetails: GatewayDetails
  setGatewayDetails: (details: GatewayDetails) => void
  onServiceAddSuccess: () => void
}

const TOTAL_ITEMS_PER_PAGE = 5

/**
 * STEPS:
 * - First select region
 * - Then Select cluster based on that region
 * - Select a service from the list
 * - Fetch detailed data for that service and append it in the gatewayDetails
 */
const COEcsSelector: React.FC<COEcsSelectorProps> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()

  const [allRegions, setAllRegions] = useState<SelectOption[]>([])
  const [selectedRegion, setSelectedRegion] = useState<SelectOption>()
  const [allContainers, setAllContainers] = useState<SelectOption[]>([])
  const [selectedContainer, setSelectedContainer] = useState<SelectOption>()
  const [allServices, setAllServices] = useState<ContainerServiceServiceMinimal[]>([])
  const [servicesToShow, setServicesToShow] = useState<ContainerServiceServiceMinimal[]>([])
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [selectedClusterService, setSelectedClusterService] = useState<ContainerServiceServiceMinimal>()

  const { data: regions, loading: regionsLoading } = useAllRegions({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: props.gatewayDetails.cloudAccount.id, // eslint-disable-line
      accountIdentifier: accountId
    }
  })

  const {
    data: containers,
    refetch: fetchContainers,
    loading: loadingContainers
  } = useGetContainerClustersOfRegion({
    account_id: accountId,
    lazy: true
  })

  const {
    data: containerServices,
    loading: loadingServices,
    refetch: fetchContainerServices,
    error: clusterServicesError
  } = useListOfServicesInContainerServiceCluster({
    account_id: accountId,
    cluster_name: '',
    lazy: true
  })

  const {
    data: serviceDescribeData,
    loading: loadingDescribeService,
    refetch: fetchDescribeService,
    error: describeServiceError
  } = useDescribeServiceInContainerServiceCluster({
    account_id: accountId,
    cluster_name: '',
    service_name: '',
    lazy: true
  })

  useEffect(() => {
    setRegionsForSelection(regions?.response)
  }, [regions])

  useEffect(() => {
    setContainersForSelection(containers?.response)
  }, [containers])

  useEffect(() => {
    if (!_isEmpty(clusterServicesError)) {
      showError(clusterServicesError)
    } else {
      const loadedServices = _defaultTo(containerServices?.response, [])
      setAllServices(loadedServices)
      setServicesToShow(loadedServices)
    }
  }, [containerServices, clusterServicesError])

  useEffect(() => {
    if (!_isEmpty(selectedRegion)) {
      fetchContainers({
        queryParams: {
          accountIdentifier: accountId,
          cloud_account_id: props.gatewayDetails.cloudAccount.id,
          region: _defaultTo(selectedRegion?.value, '') as string
        }
      })
    }
  }, [selectedRegion])

  useEffect(() => {
    setAllClusterServicesForRegion()
  }, [selectedContainer, selectedRegion])

  useEffect(() => {
    handleServiceAddition()
  }, [serviceDescribeData])

  const handleServiceAddition = () => {
    if (!_isEmpty(describeServiceError)) {
      showError(describeServiceError)
      return
    }
    if (!_isEmpty(serviceDescribeData?.response)) {
      const detailedData = serviceDescribeData?.response
      const updatedGatewayDetails: GatewayDetails = {
        ...props.gatewayDetails,
        routing: {
          ...props.gatewayDetails.routing,
          container_svc: {
            cluster: detailedData?.cluster,
            region: detailedData?.region,
            service: detailedData?.name,
            task_count: detailedData?.task_count || 1
          }
        },
        resourceMeta: {
          container_svc: {
            cluster: detailedData?.cluster,
            region: detailedData?.region,
            service: detailedData?.name,
            task_count: detailedData?.task_count
          }
        }
      }
      props.setGatewayDetails(updatedGatewayDetails)
      props.onServiceAddSuccess()
    }
  }

  const setAllClusterServicesForRegion = () => {
    if (!_isEmpty(selectedContainer) && !_isEmpty(selectedRegion)) {
      fetchContainerServices({
        queryParams: {
          accountIdentifier: accountId,
          cloud_account_id: props.gatewayDetails.cloudAccount.id,
          region: _defaultTo(selectedRegion?.value, '') as string
        },
        pathParams: {
          account_id: accountId,
          cluster_name: selectedContainer?.label
        }
      })
    }
  }

  const setRegionsForSelection = (regionsData: Region[] = []) => {
    const loaded =
      regionsData.map(r => {
        return {
          label: r.label as string,
          value: r.name as string
        }
      }) || []
    setAllRegions(loaded)
  }

  const setContainersForSelection = (containersData: ContainerClusterMinimal[] = []) => {
    const loaded: SelectOption[] =
      containersData.map(c => {
        return {
          label: c.name as string,
          value: c.id as string
        }
      }) || []
    setAllContainers(loaded)
  }

  const refreshPageParams = () => {
    setPageIndex(0)
  }

  const handleRefresh = () => {
    refreshPageParams()
    setAllClusterServicesForRegion()
  }

  const handleSearch = (text: string) => {
    const filteredServices = allServices?.filter(service => service.name?.toLowerCase().includes(text))
    setServicesToShow(filteredServices)
  }

  const handleAddSelection = () => {
    if (!_isEmpty(selectedClusterService)) {
      fetchDescribeService({
        pathParams: {
          account_id: accountId,
          cluster_name: selectedContainer?.label,
          service_name: selectedClusterService?.name
        },
        queryParams: {
          accountIdentifier: accountId,
          cloud_account_id: props.gatewayDetails.cloudAccount.id,
          region: _defaultTo(selectedRegion?.value, '') as string
        }
      })
    }
  }

  const loading = regionsLoading || loadingContainers || loadingServices

  const isDisabled = _isEmpty(selectedClusterService)

  return (
    <Container>
      <Layout.Vertical spacing="xlarge">
        <Container style={{ paddingBottom: 20, borderBottom: '1px solid #CDD3DD' }}>
          <Text font={'large'}>{getString('ce.co.autoStoppingRule.configuration.ecsModal.title')}</Text>
        </Container>
        <Layout.Vertical
          style={{
            paddingBottom: 30,
            paddingTop: 30,
            borderBottom: '1px solid #CDD3DD'
          }}
        >
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
            <Layout.Horizontal flex={{ alignItems: 'center' }} spacing={'large'}>
              <Button
                onClick={handleAddSelection}
                disabled={isDisabled}
                loading={loadingDescribeService}
                variation={ButtonVariation.PRIMARY}
              >
                {getString('ce.co.autoStoppingRule.configuration.addSelectedBtnText')}
              </Button>
              <div onClick={handleRefresh}>
                <Icon name="refresh" color="primary7" size={14} />
                <span style={{ color: 'var(--primary-7)', margin: '0 5px', cursor: 'pointer' }}>Refresh</span>
              </div>
            </Layout.Horizontal>
            <ExpandingSearchInput onChange={handleSearch} />
          </Layout.Horizontal>
          <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'large'} style={{ maxWidth: '40%' }}>
            <Select
              items={allRegions}
              onChange={item => setSelectedRegion(item)}
              disabled={regionsLoading}
              value={selectedRegion}
              inputProps={{
                placeholder: getString('ce.allRegions')
              }}
              name={'region'}
            />
            <Select
              items={allContainers}
              onChange={item => setSelectedContainer(item)}
              disabled={loadingContainers}
              value={selectedContainer}
              inputProps={{
                placeholder: getString('ce.allClusters')
              }}
              name={'cluster'}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
        <Container style={{ minHeight: 250 }}>
          {loading && (
            <Layout.Horizontal flex={{ justifyContent: 'center' }}>
              <Icon name="spinner" size={24} color="blue500" />
            </Layout.Horizontal>
          )}
          {!loading && (!selectedRegion || !selectedContainer) && (
            <Layout.Horizontal flex={{ justifyContent: 'center' }}>
              <Text icon={'execution-warning'} font={{ size: 'medium' }} iconProps={{ size: 20 }}>
                {getString('ce.co.autoStoppingRule.configuration.ecsModal.emptyDescription')}
              </Text>
            </Layout.Horizontal>
          )}
          {!loading && selectedRegion && selectedContainer && (
            <ECSServicesTable
              data={servicesToShow}
              pageIndex={pageIndex}
              selectedService={selectedClusterService}
              setSelectedService={setSelectedClusterService}
              setPageIndex={setPageIndex}
            />
          )}
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

interface ECSServicesTableProps {
  data: ContainerServiceServiceMinimal[]
  pageIndex: number
  selectedService?: ContainerServiceServiceMinimal
  setSelectedService: (service: ContainerServiceServiceMinimal) => void
  setPageIndex: (index: number) => void
}

const ECSServicesTable: React.FC<ECSServicesTableProps> = props => {
  const { pageIndex, data } = props
  const { getString } = useStrings()
  const TableCheck = (tableProps: CellProps<ContainerServiceServiceMinimal>) => {
    return (
      <Radio
        checked={props.selectedService?.name === tableProps.row.original.name}
        onClick={_ => props.setSelectedService(tableProps.row.original)}
      />
    )
  }

  const TableCell = (tableProps: CellProps<ContainerServiceServiceMinimal>) => {
    return (
      <Text lineClamp={1} color={Color.BLACK}>
        {`${tableProps.value}`}
      </Text>
    )
  }
  return (
    <TableV2<ContainerServiceServiceMinimal>
      data={data.slice(pageIndex * TOTAL_ITEMS_PER_PAGE, pageIndex * TOTAL_ITEMS_PER_PAGE + TOTAL_ITEMS_PER_PAGE)}
      pagination={{
        pageSize: TOTAL_ITEMS_PER_PAGE,
        pageIndex: pageIndex,
        pageCount: Math.ceil(data.length / TOTAL_ITEMS_PER_PAGE),
        itemCount: data.length,
        gotoPage: (newPageIndex: number) => props.setPageIndex(newPageIndex)
      }}
      columns={[
        {
          Header: '',
          id: 'selected',
          Cell: TableCheck,
          width: '5%',
          disableSortBy: true
        },
        {
          accessor: 'name',
          Header: getString('name'),
          width: '40%',
          Cell: TableCell,
          disableSortBy: true
        },
        {
          accessor: 'id',
          Header: 'ID',
          width: '50%',
          Cell: TableCell,
          disableSortBy: true
        }
      ]}
    />
  )
}

export default COEcsSelector
