import React, { useEffect, useState } from 'react'
import type { FormikProps } from 'formik'
import type { Column, Renderer, CellProps } from 'react-table'
import { useParams } from 'react-router'
import { get } from 'lodash-es'
import moment from 'moment'
import { Text, Color, Layout, Icon, IconName } from '@wings-software/uicore'
import { DelegateSelectors } from '@common/components'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/exports'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { GetDelegatesStatusV2QueryParams, useGetDelegatesStatusV2, DelegateInner } from 'services/portal'
import type { AwsKmsConfigFormData } from './AwsKmsConfig'
import css from './AwsKmsDelegateSelection.module.scss'

interface AwsKmsDelegateSelectionProps {
  connectorInfo?: ConnectorInfoDTO | void
  isEditMode: boolean
  formik: FormikProps<AwsKmsConfigFormData>
}

const AwsKmsDelegateSelection: React.FC<AwsKmsDelegateSelectionProps> = ({ connectorInfo, isEditMode, formik }) => {
  const { getString } = useStrings()
  const { accountId, module } = useParams<Record<string, string>>()

  const [delegateSelectors, setDelegateSelectors] = useState<Array<string>>([])
  const [selectedDelegate, setSelectedDelegate] = useState<Array<string>>([])
  useEffect(() => {
    if (formik.values.delegate) {
      setSelectedDelegate([...formik.values?.delegate])
    }
  }, [])

  useEffect(() => {
    const delegate = (connectorInfo as ConnectorInfoDTO)?.spec?.delegateSelectors || []
    if (isEditMode) {
      setDelegateSelectors(delegate)
    }
  }, [connectorInfo])
  const queryParams: GetDelegatesStatusV2QueryParams = { accountId, module } as GetDelegatesStatusV2QueryParams
  const { data } = useGetDelegatesStatusV2({ queryParams })
  const delegates = get(data, 'resource.delegates', [])

  const typeToNameAndIcon = (type: string): { name: string; icon: IconName } => {
    const nameAndIcon = {
      name: '',
      icon: 'cube' as IconName
    }
    switch ((type || '').toLowerCase()) {
      case 'kubernetes':
      case 'ce_kubernetes':
        nameAndIcon.name = 'K8s'
        nameAndIcon.icon = 'app-kubernetes'
        break
      case 'ecs':
        nameAndIcon.name = 'ECS'
        nameAndIcon.icon = 'service-ecs'
        break
      case 'docker':
        nameAndIcon.name = 'Docker'
        nameAndIcon.icon = 'service-dockerhub'
        break
      case 'linux':
        nameAndIcon.name = 'Linux'
        nameAndIcon.icon = 'cube'
        break
      case 'shell_script':
        nameAndIcon.name = 'Shell Script'
        nameAndIcon.icon = 'run-step'
        break
    }
    return nameAndIcon
  }

  const RenderDelegate: Renderer<CellProps<DelegateInner>> = ({ row }) => {
    return (
      <Layout.Horizontal>
        <Icon
          name={typeToNameAndIcon(row.original.delegateType as string).icon}
          size={30}
          style={{ marginRight: 'var(--spacing-small)' }}
        ></Icon>
        <Layout.Vertical>
          <Text color={Color.BLACK} font={{ weight: 'bold' }} lineClamp={1}>
            {typeToNameAndIcon(row.original.delegateType || '').name} {getString('delegate.DelegateName')}
          </Text>
          <Text color={Color.BLACK} lineClamp={1}>
            {row.original.delegateName}
          </Text>
        </Layout.Vertical>
      </Layout.Horizontal>
    )
  }

  const RenderAssessment: Renderer<CellProps<DelegateInner>> = ({ row }) => {
    return (
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
        <Text lineClamp={1}>{row.original.status}</Text>
        {selectedDelegate.findIndex(val => val === row.original.uuid) !== -1 ? (
          <Icon name={'pipeline-approval'} size={18}></Icon>
        ) : null}
      </Layout.Horizontal>
    )
  }

  const RenderDescription: Renderer<CellProps<DelegateInner>> = ({ row }) => {
    return (
      <Layout.Vertical spacing="small">
        <Text lineClamp={1}>{row.original.description}</Text>
        <Text color={Color.GREY_400} lineClamp={1}>
          {getString('connectors.awsKms.loggedAt')} {moment(row.original.lastHeartBeat).format('MMM D YYYY, hh:mm:ss')}
        </Text>
      </Layout.Vertical>
    )
  }

  const columns: Column<DelegateInner>[] = [
    {
      Header: getString('delegate.DelegateName').toUpperCase(),
      width: '40%',
      id: 'delegate',
      accessor: (row: DelegateInner) => row.delegateName || row.hostName,
      Cell: RenderDelegate
    },
    {
      Header: getString('assessment').toUpperCase(),
      width: '20%',
      id: 'assessment',
      accessor: (row: DelegateInner) => row.status,
      Cell: RenderAssessment
    },
    {
      Header: getString('details').toUpperCase(),
      width: '40%',
      id: 'details',
      accessor: (row: DelegateInner) => row.description,
      Cell: RenderDescription
    }
  ]

  return (
    <Layout.Vertical spacing="small">
      <Text
        lineClamp={1}
        font={{ size: 'medium' }}
        style={{ marginBottom: 'var(--spacing-medium)' }}
        color={Color.BLACK}
      >
        {getString('connectors.title.delegateSelection')}
      </Text>
      <Text lineClamp={1} margin={{ bottom: 'medium' }}>
        {getString('delegate.DelegateselectionConnectorText')}
      </Text>
      <DelegateSelectors
        fill
        allowNewTag={false}
        placeholder={getString('delegate.DelegateselectionPlaceholder')}
        selectedItems={delegateSelectors}
        onChange={tags => {
          setDelegateSelectors(tags as Array<string>)
        }}
      ></DelegateSelectors>
      <Table
        className={css.table}
        columns={columns}
        data={delegates}
        onRowClick={delegate => {
          setSelectedDelegate(val => {
            if (delegate?.uuid) {
              const combinedVal = new Set(val)
              if (combinedVal.has(delegate?.uuid)) {
                combinedVal.delete(delegate?.uuid)
              } else {
                combinedVal.add(delegate?.uuid)
              }
              formik.setFieldValue('delegate', [...combinedVal])
              return [...combinedVal]
            }
            return val
          })
        }}
      />

      <Text intent="danger">{formik.errors.delegate}</Text>
    </Layout.Vertical>
  )
}

export default AwsKmsDelegateSelection
