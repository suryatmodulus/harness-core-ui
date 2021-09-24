import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Select, Table, TextInput } from '@wings-software/uicore'
import type { CellProps, Column } from 'react-table'
import { debounce } from 'lodash-es'
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

const statusRegEx = new RegExp(/^\d{3}-\d{3}$/)

interface StatusRangeInputProps {
  status_code_from: number
  status_code_to: number
  onChange: (val: string) => void
}

const StatusRangeInput: React.FC<StatusRangeInputProps> = props => {
  const { status_code_from, status_code_to } = props
  const [errorFlag, setErrorFlag] = useState(false)

  const getStatusStringFromRange = (from: number | null = null, to: number | null = null) => {
    return `${from}-${to}`
  }

  return (
    <TextInput
      defaultValue={getStatusStringFromRange(status_code_from as number, status_code_to)}
      onChange={e => props.onChange((e.target as HTMLInputElement).value)}
      onBlur={e => {
        setErrorFlag(!statusRegEx.test((e.target as HTMLInputElement).value))
      }}
      errorText={'Please enter from & to values'}
      intent={errorFlag ? 'danger' : 'none'}
    />
  )
}

interface COHealthCheckTableProps {
  pattern: HealthCheck | null
  updatePattern: (pattern: HealthCheck) => void
}
const COHealthCheckTable: React.FC<COHealthCheckTableProps> = props => {
  const [healthCheckPattern, setHealthCheckPattern] = useState<HealthCheck[]>(props.pattern ? [props.pattern] : [])

  useEffect(() => {
    props.updatePattern(healthCheckPattern[0])
  }, [healthCheckPattern])

  function updateHealthCheckPattern(column: string, val: string) {
    const pattern = { ...healthCheckPattern[0] }
    switch (column) {
      case 'protocol': {
        pattern['protocol'] = val
        break
      }
      case 'port': {
        pattern['port'] = +val
        break
      }
      case 'path': {
        pattern['path'] = val
        break
      }
      case 'timeout': {
        pattern['timeout'] = +val
        break
      }
    }
    setHealthCheckPattern([pattern])
  }

  const updateInput = useCallback(debounce(updateHealthCheckPattern, 1000), [healthCheckPattern])

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

  const StatusCell = (tableProps: CellProps<HealthCheck>) => {
    return (
      <StatusRangeInput
        status_code_from={tableProps.row.original.status_code_from || 200}
        status_code_to={tableProps.row.original.status_code_to || 299}
        onChange={value => {
          if (statusRegEx.test(value)) {
            const [from, to] = value.split('-').map(Number)
            setHealthCheckPattern([{ ...healthCheckPattern[0], status_code_from: from, status_code_to: to }])
          }
        }}
      />
    )
  }

  const columns: Column<HealthCheck>[] = useMemo(
    () => [
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
      },
      {
        accessor: 'status_code_from',
        Header: 'STATUS (from-to)',
        width: '20%',
        Cell: StatusCell
      }
    ],
    [healthCheckPattern]
  )

  return (
    <Table<HealthCheck>
      data={healthCheckPattern}
      bpTableProps={{}}
      className={css.healthCheckTable}
      columns={columns}
    />
  )
}

export default COHealthCheckTable
