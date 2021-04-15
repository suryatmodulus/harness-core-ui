import React, { useEffect, useState } from 'react'
import { Select, Table, TextInput } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import debounce from 'lodash-es/debounce'
import { useCallback } from 'react'
import type { HealthCheck } from 'services/lw'
import type { InstanceDetails } from '../COCreateGateway/models'
import css from './COGatewayConfig.module.scss'
interface SelectItem {
  label: string
  value: string
}

const protocols: SelectItem[] = [
  {
    label: 'http',
    value: 'http'
  },
  {
    label: 'https',
    value: 'https'
  }
]

interface COHealthCheckTableProps {
  pattern: HealthCheck
  updatePattern: (pattern: HealthCheck) => void
}
const COHealthCheckTable: React.FC<COHealthCheckTableProps> = props => {
  const [helathCheckPattern, setHealthCheckPattern] = useState<HealthCheck[]>([props.pattern])

  useEffect(() => {
    props.updatePattern(helathCheckPattern[0])
  }, [helathCheckPattern])
  function updateHealthCheckPattern(column: string, val: string) {
    switch (column) {
      case 'protocol': {
        props.pattern['protocol'] = val
        break
      }
      case 'port': {
        props.pattern['port'] = val
        break
      }
      case 'path': {
        props.pattern['path'] = val
        break
      }
      case 'timeout': {
        props.pattern['timeout'] = val
        break
      }
    }
    setHealthCheckPattern([props.pattern])
  }
  const updateInput = useCallback(debounce(updateHealthCheckPattern, 1000), [])
  function getItembyValue(items: SelectItem[], value: string): SelectItem {
    return items.filter(x => x.value == value)[0]
  }
  function InputCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return (
      <TextInput
        defaultValue={tableProps.value}
        style={{ border: 'none' }}
        onChange={e => {
          const value = (e.currentTarget as HTMLInputElement).value
          updateInput(tableProps.column.id, value)
        }}
      />
    )
  }
  function ProtocolCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return (
      <Select
        className={css.selectCell}
        value={getItembyValue(protocols, tableProps.value)}
        items={protocols}
        onChange={e => {
          updateHealthCheckPattern(tableProps.column.id, e.value.toString())
        }}
      />
    )
  }
  return (
    <Table<HealthCheck>
      data={helathCheckPattern}
      bpTableProps={{}}
      className={css.healthCheckTable}
      columns={[
        {
          accessor: 'protocol',
          Header: 'PROTOCOL',
          width: '16.5%',
          Cell: ProtocolCell
        },
        {
          accessor: 'path',
          Header: 'PATH',
          width: '16.5%',
          Cell: InputCell,
          disableSortBy: true
        },
        {
          accessor: 'port',
          Header: 'PORT',
          width: '16.5%',
          Cell: InputCell
        },
        {
          accessor: 'timeout',
          Header: 'TIMEOUT(SECS)',
          width: '16.5%',
          Cell: InputCell
        }
      ]}
    />
  )
}

export default COHealthCheckTable
