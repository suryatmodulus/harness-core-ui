import React from 'react'
import { Icon, Select, Table, TextInput } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import { debounce as _debounce } from 'lodash-es'
import type { PortConfig } from 'services/lw'
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

const actions: SelectItem[] = [
  {
    label: 'Redirect',
    value: 'redirect'
  },
  {
    label: 'Forward',
    value: 'forward'
  }
]

interface CORoutingTableProps {
  routingRecords: PortConfig[]
  setRoutingRecords: (records: PortConfig[]) => void
}
const CORoutingTable: React.FC<CORoutingTableProps> = props => {
  const debouncedInputHandler = React.useCallback(
    _debounce((value: string, tableProps: CellProps<InstanceDetails>) => {
      updatePortConfig(tableProps.row.index, tableProps.column.id, value)
    }, 500),
    [props.routingRecords]
  )
  function updatePortConfig(index: number, column: string, val: string) {
    const portConfig = [...props.routingRecords]
    switch (column) {
      case 'protocol': {
        portConfig[index]['protocol'] = val
        break
      }
      case 'target_protocol': {
        portConfig[index]['target_protocol'] = val
        break
      }
      case 'action': {
        portConfig[index]['action'] = val
        break
      }
      case 'redirect_url': {
        portConfig[index]['redirect_url'] = val
        break
      }
      case 'server_name': {
        portConfig[index]['server_name'] = val
        break
      }
      case 'routing_rules': {
        portConfig[index]['routing_rules'] = [{ path_match: val }] // eslint-disable-line
        break
      }
      case 'port': {
        portConfig[index]['port'] = +val
        break
      }
      case 'target_port': {
        portConfig[index]['target_port'] = +val
        break
      }
    }
    props.setRoutingRecords(portConfig)
  }
  function deletePortConfig(index: number) {
    const portConfig = [...props.routingRecords]
    portConfig.splice(index, 1)
    props.setRoutingRecords(portConfig)
  }

  function getItembyValue(items: SelectItem[], value: string): SelectItem {
    return items.filter(x => x.value == value)[0]
  }
  function InputCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return (
      <TextInput
        defaultValue={tableProps.value}
        style={{ border: 'none' }}
        onChange={e => debouncedInputHandler((e.target as HTMLInputElement).value, tableProps)}
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
          updatePortConfig(tableProps.row.index, tableProps.column.id, e.value.toString())
        }}
      />
    )
  }
  function ActionCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return (
      <Select
        className={css.selectCell}
        value={getItembyValue(actions, tableProps.value)}
        items={actions}
        onChange={e => {
          updatePortConfig(tableProps.row.index, tableProps.column.id, e.value.toString())
        }}
      />
    )
  }
  function PathCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return (
      <TextInput
        defaultValue={tableProps.value.length ? tableProps.value[0].path_match : ''}
        style={{ border: 'none' }}
        onChange={e => debouncedInputHandler((e.target as HTMLInputElement).value, tableProps)}
      />
    )
  }
  function DeleteCell(tableProps: CellProps<InstanceDetails>): JSX.Element {
    return <Icon name="trash" onClick={() => deletePortConfig(tableProps.row.index)}></Icon>
  }
  // const fields: Field[] = [
  //   {
  //     name: 'protocol',
  //     label: <div style={{ fontWeight: 'bold' }}>LISTEN PROTOCOL</div>,
  //     renderer: (value, _index, handleChange) => (
  //       <Select
  //         className={css.selectCell}
  //         value={getItembyValue(protocols, value)}
  //         items={protocols}
  //         onChange={e => {
  //           updateField(_index, e.value.toString())
  //         }}
  //       />
  //     )
  //   },
  //   {
  //     name: 'port',
  //     label: <div style={{ fontWeight: 'bold' }}>PORT</div>,
  //     renderer: (value, _index, handleChange) => (
  //       <TextInput
  //         defaultValue={value}
  //         onChange={e => {
  //           const value = (e.currentTarget as HTMLInputElement).value
  //           updateField(_index, value)
  //         }}
  //       />
  //     )
  //   },
  //   {
  //     name: 'action',
  //     label: <div style={{ fontWeight: 'bold' }}>ACTION</div>,
  //     renderer: (value, _index, handleChange) => (
  //       <Select
  //         className={css.selectCell}
  //         value={getItembyValue(actions, value)}
  //         items={actions}
  //         onChange={e => {
  //           updateField(_index, e.value.toString())
  //         }}
  //       />
  //     )
  //   },
  //   {
  //     name: 'target_protocol',
  //     label: <div style={{ fontWeight: 'bold' }}>TARGET PROTOCOL</div>,
  //     renderer: (value, _index, handleChange) => (
  //       <Select
  //         className={css.selectCell}
  //         value={getItembyValue(protocols, value)}
  //         items={protocols}
  //         onChange={e => {
  //           updateField(_index, e.value.toString())
  //         }}
  //       />
  //     )
  //   },
  //   {
  //     name: 'target_port',
  //     label: <div style={{ fontWeight: 'bold' }}>TARGET PORT</div>,
  //     renderer: (value, _index, handleChange) => (
  //       <TextInput
  //         defaultValue={value}
  //         onChange={e => {
  //           const value = (e.currentTarget as HTMLInputElement).value
  //           updateField(_index, value)
  //         }}
  //       />
  //     )
  //   },
  //   {
  //     name: 'redirect_url',
  //     label: <div style={{ fontWeight: 'bold' }}>REDIRECT URL</div>,
  //     renderer: (value, _index, handleChange) => (
  //       <TextInput
  //         defaultValue={value}
  //         onChange={e => {
  //           const value = (e.currentTarget as HTMLInputElement).value
  //           updateField(_index, value)
  //         }}
  //       />
  //     )
  //   },
  //   {
  //     name: 'server_name',
  //     label: <div style={{ fontWeight: 'bold' }}>SERVER NAME</div>,
  //     renderer: (value, _index, handleChange) => (
  //       <TextInput
  //         defaultValue={value}
  //         onChange={e => {
  //           const value = (e.currentTarget as HTMLInputElement).value
  //           updateField(_index, value)
  //         }}
  //       />
  //     )
  //   },
  //   {
  //     name: 'path_match',
  //     label: <div style={{ fontWeight: 'bold' }}>PATH MATCH</div>,
  //     renderer: (value, _index, handleChange) => (
  //       <TextInput
  //         defaultValue={value}
  //         onChange={e => {
  //           const value = (e.currentTarget as HTMLInputElement).value
  //           updateField(_index, value)
  //         }}
  //       />
  //     )
  //   }
  // ]
  // const [routingData, setRoutingData] = useState<PortConfig[]>(props.routingRecords)
  // function updateField(index: number, val: string) {
  //   console.log(index, val)
  // }
  // useEffect(() => {
  //   console.log(routingData, props.routingRecords)
  //   setRoutingData([...props.routingRecords])
  // }, [props.routingRecords])
  // React.useEffect(() => {
  //   setRoutingData(prevState => [...prevState, ...props.routingRecords])
  // }, [props.routingRecords])
  // console.log(routingData)
  return (
    <Table<PortConfig>
      data={props.routingRecords}
      className={css.routingTable}
      bpTableProps={{}}
      columns={[
        {
          accessor: 'protocol',
          Header: 'LISTEN PROTOCOL',
          width: '16.5%',
          Cell: ProtocolCell
        },
        {
          accessor: 'port',
          Header: 'LISTEN PORT',
          width: '16.5%',
          Cell: InputCell,
          disableSortBy: true
        },
        {
          accessor: 'action',
          Header: 'ACTION',
          width: '16.5%',
          Cell: ActionCell
        },
        {
          accessor: 'target_protocol',
          Header: 'TARGET PROTOCOL',
          width: '16.5%',
          Cell: ProtocolCell
        },
        {
          accessor: 'target_port',
          Header: 'TARGET PORT',
          width: '16.5%',
          Cell: InputCell
        },
        {
          accessor: 'redirect_url',
          Header: 'REDIRECT URL',
          width: '16.5%',
          Cell: InputCell
        },
        {
          accessor: 'server_name',
          Header: 'SERVER NAME',
          width: '16.5%',
          Cell: InputCell
        },
        {
          accessor: 'routing_rules',
          Header: 'PATH MATCH',
          width: '16.5%',
          Cell: PathCell
        },
        {
          Header: '',
          id: 'menu',
          accessor: row => row.port,
          width: '16.5%',
          Cell: DeleteCell
        }
      ]}
    />
    // <Formik
    //   key={Math.random()}
    //   initialValues={{ routingRecords: routingData }}
    //   enableReinitialize={true}
    //   onSubmit={() => console.log('submit')}
    //   validate={e => {
    //     console.log(e)
    //   }}
    // >
    //   {fprops => (
    //     // <form onSubmit={fprops.handleSubmit}>
    //     <FieldArray name="routingRecords" fields={fields} label="" />
    //     // </form>
    //   )}
    // </Formik>
  )
}

export default CORoutingTable
