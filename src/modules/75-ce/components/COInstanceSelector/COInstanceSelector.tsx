import React, { useState } from 'react'
import type { CellProps } from 'react-table'
import { isEmpty as _isEmpty } from 'lodash-es'
import { Text, Color, Container, ExpandingSearchInput, Layout, Checkbox, Button, Icon } from '@wings-software/uicore'
import Table from '@common/components/Table/Table'
import type { GatewayDetails, InstanceDetails } from '@ce/components/COCreateGateway/models'
import { useStrings } from 'framework/strings'
import css from './COInstanceSelector.module.scss'

interface COInstanceSelectorprops {
  instances: InstanceDetails[]
  selectedInstances: InstanceDetails[]
  setSelectedInstances: (selectedInstances: InstanceDetails[]) => void
  search: (t: string) => void
  setGatewayDetails: (gatewayDetails: GatewayDetails) => void
  gatewayDetails: GatewayDetails
  onInstancesAddSuccess?: () => void
  loading?: boolean
}

function TableCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}
function NameCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value} {tableProps.row.original.id}
    </Text>
  )
}

const TOTAL_ITEMS_PER_PAGE = 8

const COInstanceSelector: React.FC<COInstanceSelectorprops> = props => {
  const [selectedInstances, setSelectedInstances] = useState<InstanceDetails[]>(props.selectedInstances || [])
  const [pageIndex, setPageIndex] = useState<number>(0)
  const instances: InstanceDetails[] = props.instances
  const { getString } = useStrings()
  function TableCheck(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return (
      <Checkbox
        checked={isSelectedInstance(tableProps.row.original)}
        onChange={e => {
          if (e.currentTarget.checked && !isSelectedInstance(tableProps.row.original)) {
            setSelectedInstances([...selectedInstances, tableProps.row.original])
          } else if (!e.currentTarget.checked && isSelectedInstance(tableProps.row.original)) {
            const updatedInstances = [...selectedInstances]
            updatedInstances.splice(selectedInstances.indexOf(tableProps.row.original), 1)
            setSelectedInstances(updatedInstances)
          }
        }}
      />
    )
  }
  function isSelectedInstance(item: InstanceDetails): boolean {
    return selectedInstances.findIndex(s => s.id == item.id) >= 0 ? true : false
  }

  const addInstances = () => {
    const newInstances = [...selectedInstances]
    props.setSelectedInstances(newInstances)
    props.gatewayDetails.selectedInstances = newInstances
    props.setGatewayDetails(props.gatewayDetails)
    props.onInstancesAddSuccess?.()
  }

  const handleSearch = (text: string) => {
    pageIndex !== 0 && setPageIndex(0)
    props.search(text)
  }

  return (
    <Container>
      <Layout.Vertical spacing="large">
        <Container style={{ paddingBottom: 20, borderBottom: '1px solid #CDD3DD' }}>
          <Text font={'large'}>Select Instances</Text>
        </Container>
        <Layout.Horizontal
          style={{
            paddingBottom: 20,
            paddingTop: 20,
            borderBottom: '1px solid #CDD3DD',
            justifyContent: 'space-between'
          }}
        >
          <Button
            onClick={addInstances}
            disabled={_isEmpty(selectedInstances)}
            style={{
              backgroundColor: selectedInstances.length ? '#0278D5' : 'inherit',
              color: selectedInstances.length ? '#F3F3FA' : 'inherit'
            }}
          >
            {`Add selected ${selectedInstances.length ? '(' + selectedInstances.length + ')' : ''}`}
          </Button>
          <ExpandingSearchInput className={css.search} onChange={handleSearch} />
        </Layout.Horizontal>
        <Container>
          {props.loading && (
            <Layout.Horizontal flex={{ justifyContent: 'center' }}>
              <Icon name="spinner" size={24} color="blue500" />
            </Layout.Horizontal>
          )}
          {!props.loading && (
            <Table
              className={css.instancesTable}
              data={(instances || []).slice(
                pageIndex * TOTAL_ITEMS_PER_PAGE,
                pageIndex * TOTAL_ITEMS_PER_PAGE + TOTAL_ITEMS_PER_PAGE
              )}
              pagination={{
                pageSize: TOTAL_ITEMS_PER_PAGE,
                pageIndex: pageIndex,
                pageCount: Math.ceil((props.instances || []).length / TOTAL_ITEMS_PER_PAGE) ?? 1,
                itemCount: (props.instances || []).length,
                gotoPage: newPageIndex => setPageIndex(newPageIndex)
              }}
              columns={[
                {
                  Header: '',
                  id: 'selected',
                  Cell: TableCheck,
                  width: '5%'
                },
                {
                  accessor: 'name',
                  Header: getString('ce.co.instanceSelector.name'),
                  width: '20%',
                  Cell: NameCell,
                  disableSortBy: true
                },
                {
                  accessor: 'ipv4',
                  Header: getString('ce.co.instanceSelector.ipAddress'),
                  width: '15%',
                  Cell: TableCell,
                  disableSortBy: true
                },
                {
                  accessor: 'region',
                  Header: getString('regionLabel'),
                  width: '15%',
                  Cell: TableCell,
                  disableSortBy: true
                },
                {
                  accessor: 'type',
                  Header: getString('typeLabel'),
                  width: '10%',
                  Cell: TableCell,
                  disableSortBy: true
                },
                {
                  accessor: 'tags',
                  Header: getString('tagsLabel'),
                  width: '10%',
                  Cell: TableCell,
                  disableSortBy: true
                },
                {
                  accessor: 'launch_time',
                  Header: getString('ce.co.instanceSelector.launchTime'),
                  width: '15%',
                  Cell: TableCell,
                  disableSortBy: true
                },
                {
                  accessor: 'status',
                  Header: getString('status'),
                  width: '10%',
                  Cell: TableCell,
                  disableSortBy: true
                }
              ]}
            />
          )}
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

export default COInstanceSelector
