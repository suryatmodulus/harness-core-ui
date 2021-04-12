import React, { useMemo, useState } from 'react'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { Menu, Position, Classes } from '@blueprintjs/core'
import type { Column, Renderer, CellProps } from 'react-table'
import { Text, Color, Layout, Icon, Button, Popover } from '@wings-software/uicore'

import Table from '@common/components/Table/Table'
import { useToaster, useConfirmationDialog } from '@common/exports'
import { SecretResponseWrapper, useDeleteSecretV2 } from 'services/cd-ng'
import type { PageSecretResponseWrapper, SecretTextSpecDTO } from 'services/cd-ng'
import { getStringForType } from '@secrets/utils/SSHAuthUtils'
import TagsPopover from '@common/components/TagsPopover/TagsPopover'
import useCreateSSHCredModal from '@secrets/modals/CreateSSHCredModal/useCreateSSHCredModal'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import { useVerifyModal } from '@secrets/modals/CreateSSHCredModal/useVerifyModal'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { SecretIdentifiers } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import i18n from '../../SecretsPage.i18n'
import css from './SecretsList.module.scss'

interface SecretsListProps {
  secrets?: PageSecretResponseWrapper
  gotoPage: (pageNumber: number) => void
  refetch?: () => void
}

const RenderColumnSecret: Renderer<CellProps<SecretResponseWrapper>> = ({ row }) => {
  const data = row.original.secret
  return (
    <Layout.Horizontal>
      {data.type === 'SecretText' || data.type === 'SecretFile' ? (
        <Icon name="key" size={28} margin={{ top: 'xsmall', right: 'small' }} />
      ) : null}
      {data.type === 'SSHKey' ? <Icon name="secret-ssh" size={28} margin={{ top: 'xsmall', right: 'small' }} /> : null}
      <Layout.Vertical>
        <Layout.Horizontal spacing="small" width={230}>
          <Text color={Color.BLACK} lineClamp={1}>
            {data.name}
          </Text>
          {data.tags && Object.keys(data.tags).length ? <TagsPopover tags={data.tags} /> : null}
        </Layout.Horizontal>
        <Text color={Color.GREY_400} width={230} lineClamp={1}>
          {data.identifier}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const RenderColumnDetails: Renderer<CellProps<SecretResponseWrapper>> = ({ row }) => {
  const data = row.original.secret
  return (
    <>
      {data.type === 'SecretText' || data.type === 'SecretFile' ? (
        <Text color={Color.BLACK} lineClamp={1} width={230}>
          {(data.spec as SecretTextSpecDTO).secretManagerIdentifier}
        </Text>
      ) : null}
      {/* TODO {Abhinav} display SM name */}
      <Text color={Color.GREY_400}>{getStringForType(data.type)}</Text>
    </>
  )
}

const RenderColumnActivity: Renderer<CellProps<SecretResponseWrapper>> = ({ row }) => {
  const data = row.original
  return data.updatedAt ? (
    <Layout.Horizontal spacing="small">
      <Icon name="activity" />
      <ReactTimeago date={data.updatedAt} />
    </Layout.Horizontal>
  ) : null
}

const RenderColumnStatus: Renderer<CellProps<SecretResponseWrapper>> = ({ row }) => {
  const data = row.original.secret
  const { openVerifyModal } = useVerifyModal()
  if (data.type === 'SecretText' || data.type === 'SecretFile') {
    return row.original.draft ? (
      <Text icon="warning-sign" intent="warning">
        {i18n.incompleteSecret}
      </Text>
    ) : null
  }
  if (data.type === 'SSHKey')
    return (
      <Button
        font="small"
        text={i18n.testconnection}
        onClick={e => {
          e.stopPropagation()
          openVerifyModal(data)
          return
        }}
      />
    )

  return null
}

const RenderColumnAction: Renderer<CellProps<SecretResponseWrapper>> = ({ row, column }) => {
  const data = row.original.secret
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const { showSuccess, showError } = useToaster()
  const [menuOpen, setMenuOpen] = useState(false)
  const { mutate: deleteSecret } = useDeleteSecretV2({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier },
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  const { openCreateSSHCredModal } = useCreateSSHCredModal({ onSuccess: (column as any).refreshSecrets })
  const { openCreateSecretModal } = useCreateUpdateSecretModal({ onSuccess: (column as any).refreshSecrets })

  const [canUpdate, canDelete] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.SECRET,
        resourceIdentifier: data.identifier
      },
      permissions: [PermissionIdentifier.UPDATE_SECRET, PermissionIdentifier.DELETE_SECRET]
    },
    []
  )

  const { openDialog } = useConfirmationDialog({
    contentText: i18n.confirmDelete(data.name || ''),
    titleText: i18n.confirmDeleteTitle,
    confirmButtonText: i18n.btnDelete,
    cancelButtonText: i18n.btnCancel,
    onCloseDialog: async didConfirm => {
      if (didConfirm && data.identifier) {
        try {
          await deleteSecret(data.identifier)
          showSuccess(`Secret ${data.name} deleted`)
          ;(column as any).refreshSecrets?.()
        } catch (err) {
          showError(err.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    openDialog()
  }

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    data.type === 'SSHKey'
      ? openCreateSSHCredModal(data)
      : openCreateSecretModal(data.type, {
          identifier: data.identifier,
          orgIdentifier: data.orgIdentifier,
          projectIdentifier: data.projectIdentifier
        } as SecretIdentifiers)
  }

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          icon="Options"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu>
          <Menu.Item icon="edit" text="Edit" onClick={handleEdit} disabled={!canUpdate} />
          <Menu.Item icon="trash" text="Delete" onClick={handleDelete} disabled={!canDelete} />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const SecretsList: React.FC<SecretsListProps> = ({ secrets, refetch, gotoPage }) => {
  const history = useHistory()
  const data: SecretResponseWrapper[] = useMemo(() => secrets?.content || [], [secrets?.content])
  const { pathname } = useLocation()
  const columns: Column<SecretResponseWrapper>[] = useMemo(
    () => [
      {
        Header: i18n.table.secret,
        accessor: row => row.secret.name,
        id: 'name',
        width: '30%',
        Cell: RenderColumnSecret
      },
      {
        Header: i18n.table.secretManager,
        accessor: row => row.secret.description,
        id: 'details',
        width: '25%',
        Cell: RenderColumnDetails
      },
      {
        Header: i18n.table.lastActivity,
        accessor: 'updatedAt',
        id: 'activity',
        width: '20%',
        Cell: RenderColumnActivity
      },
      {
        Header: '',
        accessor: row => row.secret.type,
        id: 'status',
        width: '20%',
        Cell: RenderColumnStatus,
        refreshSecrets: refetch,
        disableSortBy: true
      },
      {
        Header: '',
        accessor: row => row.secret.identifier,
        id: 'action',
        width: '5%',
        Cell: RenderColumnAction,
        refreshSecrets: refetch,
        disableSortBy: true
      }
    ],
    [refetch]
  )

  return (
    <Table<SecretResponseWrapper>
      className={css.table}
      columns={columns}
      data={data}
      onRowClick={secret => {
        history.push(`${pathname}/${secret.secret?.identifier}`)
      }}
      pagination={{
        itemCount: secrets?.totalItems || 0,
        pageSize: secrets?.pageSize || 10,
        pageCount: secrets?.totalPages || -1,
        pageIndex: secrets?.pageIndex || 0,
        gotoPage
      }}
    />
  )
}

export default SecretsList
