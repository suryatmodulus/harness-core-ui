import React, { Dispatch, SetStateAction } from 'react'
import { Button, Color, Layout, Text } from '@wings-software/uicore'
import { RadioGroup, Radio } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import Table from '@common/components/Table/Table'
import type { artifactTableItem } from '../../utils/TriggersWizardPageUtils'
import css from './ArtifactTableInfo.module.scss'

interface ArtifactTableInfoInterface {
  artifactTableData?: any
  selectedArtifact?: any
  selectedArtifactLabel?: string
  artifactType?: string
  selectedStage?: string
  isManifest: boolean
  setSelectedStage?: Dispatch<SetStateAction<any>>
  setSelectedArtifact?: Dispatch<SetStateAction<any>>
  setSelectedArtifactLabel?: Dispatch<SetStateAction<any>>
  formikProps: any
  appliedArtifact?: any
  editArtifact?: () => void
}

interface RenderColumnSelectColumn {
  selectedArtifactLabel?: string
}
export interface FormValues {
  artifact?: string
}

export interface RenderColumnRow {
  original: artifactTableItem
}
interface RenderColumnEditColumn {
  editArtifact: () => void
}

const RenderColumnSelect = ({ row, column }: { row: RenderColumnRow; column: RenderColumnSelectColumn }) => {
  const data = row.original
  return (
    <>
      <Layout.Horizontal spacing="small" style={{ justifyContent: 'center' }}>
        <RadioGroup
          selectedValue={column?.selectedArtifactLabel}
          label=""
          name="artifactLabel"
          onChange={e => e.preventDefault()}
        >
          <Radio value={data.artifactLabel} />
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

const RenderColumnArtifactLabel = ({ row }: { row: RenderColumnRow }) => {
  const data = row.original
  return (
    <Layout.Horizontal>
      <Text color={Color.BLACK}>{data.artifactLabel}</Text>
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

const RenderColumnLocation = ({ row }: { row: RenderColumnRow }) => {
  const data = row.original
  return (
    <Layout.Horizontal>
      <Text color={Color.BLACK}>{data.location}</Text>
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

const RenderColumnVersion = ({ row }: { row: RenderColumnRow }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      <Text color={Color.BLACK}>{data.version}</Text>
    </Layout.Horizontal>
  )
}

const RenderColumnHasRuntimeInputs = ({ row }: { row: RenderColumnRow }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      <Text color={Color.BLACK}>{data.hasRuntimeInputs ? 'Yes' : 'No'}</Text>
    </Layout.Horizontal>
  )
}

const RenderColumnEdit = ({ column }: { column: RenderColumnEditColumn }) => {
  return (
    <>
      <Layout.Horizontal spacing="small" style={{ justifyContent: 'center' }}>
        <Button
          style={{ color: 'var(--primary-7)' }}
          minimal
          // className={css.actionButton}
          icon="edit"
          onClick={() => column.editArtifact()}
        />
      </Layout.Horizontal>
    </>
  )
}

const ArtifactTableInfo = (props: ArtifactTableInfoInterface): JSX.Element => {
  const {
    appliedArtifact,
    setSelectedArtifact,
    selectedArtifactLabel,
    setSelectedArtifactLabel,
    setSelectedStage,
    formikProps,
    isManifest,
    editArtifact,
    artifactTableData
  } = props

  const { getString } = useStrings()
  const artifactOrManifestText = isManifest
    ? getString('manifestsText')
    : getString('pipeline.triggers.artifactTriggerConfigPanel.artifact')

  const newData = appliedArtifact || artifactTableData
  // should render differently for applied or data table
  // remove has runtime input and version when appliedTable
  const columns: any = React.useMemo(
    () => [
      {
        Header: artifactOrManifestText?.toUpperCase(),
        accessor: 'artifactLabel',
        width: '25%',
        Cell: RenderColumnArtifactLabel,
        className: 'className',
        class: 'class',
        disableSortBy: !!appliedArtifact
      },
      {
        Header: getString?.('pipeline.triggers.artifactTriggerConfigPanel.artifactRepository', {
          artifact: artifactOrManifestText
        }).toUpperCase(),
        accessor: 'activity',
        width: '25%',
        Cell: RenderColumnArtifactRepository,
        disableSortBy: true,
        getString
      },
      {
        Header: getString?.('common.location').toUpperCase(),
        accessor: 'lastExecutionTime',
        width: '18%',
        Cell: RenderColumnLocation,
        disableSortBy: true,
        getString
      }
    ],
    [appliedArtifact, formikProps, getString]
  )

  if (!newData) {
    return <></>
  }

  if (!appliedArtifact) {
    columns.unshift({
      Header: '',
      accessor: 'select',
      width: '4%',
      disableSortBy: true,
      selectedArtifactLabel,
      formikProps,
      Cell: RenderColumnSelect
    })
    // Insert Location when available
    if (isManifest) {
      columns.push({
        Header: getString?.('version').toUpperCase(),
        accessor: 'version',
        width: '16%',
        Cell: RenderColumnVersion,
        disableSortBy: true
      })
    } else {
      columns.push({
        Header: getString?.('pipeline.triggers.artifactTriggerConfigPanel.buildTag').toUpperCase(),
        accessor: 'buildTag',
        width: '16%',
        Cell: RenderColumnBuildTag,
        disableSortBy: true
      })
    }

    columns.push({
      Header: getString?.('pipeline.triggers.artifactTriggerConfigPanel.hasRuntimeInputs').toUpperCase(),
      accessor: 'hasRuntimeInputs',
      width: '11%',
      Cell: RenderColumnHasRuntimeInputs,
      disableSortBy: true
    })
  } else {
    columns.push({
      Header: ' ',
      accessor: 'edit',
      width: '10%',
      disableSortBy: true,
      appliedArtifact,
      formikProps,
      editArtifact,
      Cell: RenderColumnEdit
    })
  }

  return (
    <Table
      className={`${css.table} ${appliedArtifact && css.appliedArtifact}`}
      columns={columns}
      data={Array.isArray(newData) ? newData : [newData]}
      onRowClick={item => {
        setSelectedArtifact?.(item?.artifactId)
        setSelectedStage?.(item?.stageId)
        setSelectedArtifactLabel?.(item?.artifactLabel)
      }}
    />
  )
}
export default ArtifactTableInfo
