import React, { useEffect, Dispatch, SetStateAction } from 'react'
import type { FormikProps } from 'formik'
import { Button, Color, Layout, Text } from '@wings-software/uicore'
import { RadioGroup, Radio } from '@blueprintjs/core'
import { useStrings, UseStringsReturn } from 'framework/strings'
import Table from '@common/components/Table/Table'
import css from './ArtifactTableInfo.module.scss'

interface ArtifactTableInfoInterface {
  data: any
  selectedArtifact?: string
  setSelectedArtifact?: Dispatch<SetStateAction<any>>
  formikProps: any
  readonly?: boolean
}

interface RenderColumnSelectColumn {
  selectedArtifact: string
}
export interface FormValues {
  artifact?: string
}
interface RenderColumnLocationColumn {
  formikProps: FormikProps<FormValues>
  getString: UseStringsReturn['getString']
}

interface RenderColumnRow {
  original: {
    artifactId: string
    name: string
    stage: string
    service: string
    artifactRepository: string
    location: string
    buildTag: string
  }
}

const RenderColumnSelect = ({ row, column }: { row: RenderColumnRow; column: RenderColumnSelectColumn }) => {
  const data = row.original
  return (
    <>
      <Layout.Horizontal spacing="small" style={{ justifyContent: 'center' }}>
        <RadioGroup
          selectedValue={column?.selectedArtifact}
          label=""
          name="artifact"
          onChange={e => e.preventDefault()}
        >
          <Radio value={data.artifactId} />
        </RadioGroup>
      </Layout.Horizontal>
    </>
  )
}

// const RenderColumnEdit = ({ row, column }) => {
//   const { values } = column.formikProps
//   const data = row.original
//   return (
//     <>
//       <Layout.Horizontal spacing="small" style={{ justifyContent: 'center' }} >
//         <Button
//           style={{ color: 'var(--primary-7)' }}
//           minimal
//           className={css.actionButton}
//           icon="edit"
//           onClick={e => {

//           }}
//         />
//       </Layout.Horizontal>
//     </>
//   )
// }

const RenderColumnArtifact = ({ row }: { row: RenderColumnRow }) => {
  const data = row.original
  return (
    <Layout.Horizontal>
      <Text color={Color.BLACK}>
        {data.stage}: {data.name} ({data.service})
      </Text>
    </Layout.Horizontal>
  )
}
const RenderColumnArtifactRepository = ({ row }: { row: RenderColumnRow }) => {
  const data = row.original
  return (
    <Layout.Horizontal>
      <Text color={Color.BLACK}>{data.artifactRepository}</Text>
    </Layout.Horizontal>
  )
}

const RenderColumnLocation = ({ row, column }: { row: RenderColumnRow; column: RenderColumnLocationColumn }) => {
  const data = row.original
  const readonly = column?.formikProps?.values?.artifact
  return (
    <Layout.Horizontal>
      {readonly ? (
        <Button
          style={{ color: column?.formikProps?.values?.artifact ? 'var(--primary-7)' : 'var(--black)', padding: '0' }}
          minimal
        >
          {column?.getString('pipeline.triggers.artifactTriggerConfigPanel.configureInputs')}
        </Button>
      ) : (
        <Text color={Color.BLACK}>
          {data.buildTag || column?.getString('pipeline.triggers.artifactTriggerConfigPanel.parameterized')}
        </Text>
      )}
    </Layout.Horizontal>
  )
}

const RenderColumnBuildTag = ({ row }: { row: RenderColumnRow }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      <Text color={Color.BLACK}>{data.buildTag}</Text>
    </Layout.Horizontal>
  )
}

const ArtifactTableInfo = (props: ArtifactTableInfoInterface): JSX.Element => {
  const { readonly, selectedArtifact, setSelectedArtifact, formikProps, data } = props
  const { getString } = useStrings()

  useEffect(() => {
    formikProps.validateForm()
  }, [])

  const columns: any = React.useMemo(
    () => [
      {
        Header: getString('pipeline.triggers.artifactTriggerConfigPanel.artifact').toUpperCase(),
        accessor: 'artifactId',
        width: '35%',
        Cell: RenderColumnArtifact,
        className: 'className',
        class: 'class'
      },
      {
        Header: getString('pipeline.triggers.artifactTriggerConfigPanel.artifactRepository').toUpperCase(),
        accessor: 'activity',
        width: '25%',
        Cell: RenderColumnArtifactRepository,
        disableSortBy: true,
        getString
      },
      {
        Header: getString('common.location').toUpperCase(),
        accessor: 'lastExecutionTime',
        width: '20%',
        Cell: RenderColumnLocation,
        disableSortBy: true,
        formikProps,
        getString
      },
      {
        Header: getString('pipeline.triggers.artifactTriggerConfigPanel.buildTag').toUpperCase(),
        accessor: 'webhook',
        width: '10%',
        Cell: RenderColumnBuildTag,
        disableSortBy: true
      }
    ],
    [getString]
  )

  if (!readonly) {
    columns.unshift({
      Header: getString('select').toUpperCase(),
      accessor: 'select',
      width: '7%',
      disableSortBy: true,
      selectedArtifact,
      formikProps,
      Cell: RenderColumnSelect
    })
  }
  //   Edit will be with Location column
  //    else {
  //     columns.push({
  //       Header: ' ',
  //       accessor: 'edit',
  //       width: '10%',
  //       disableSortBy: true,
  //       selectedArtifact,
  //       formikProps,
  //       Cell: RenderColumnEdit
  //     })
  //   }
  return (
    <Table
      className={`${css.table} ${readonly && css.readonly}`}
      columns={columns}
      data={data || /* istanbul ignore next */ []}
      onRowClick={item => setSelectedArtifact?.(item?.artifactId)}
    />
  )
}
export default ArtifactTableInfo
