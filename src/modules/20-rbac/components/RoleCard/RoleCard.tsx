import React, { useState } from 'react'
import { Card, CardBody, Color, Icon, Layout, Text } from '@wings-software/uicore'

import { useHistory, useParams } from 'react-router-dom'
import { Classes, Intent, Menu } from '@blueprintjs/core'
import { Role, RoleResponse, useDeleteRole } from 'services/rbac'
import routes from '@common/RouteDefinitions'
import { useConfirmationDialog, useToaster } from '@common/exports'
import { useStrings } from 'framework/exports'
import { getRoleIcon } from '@rbac/utils/RoleData'
import css from './RoleCard.module.scss'

interface RoleCardProps {
  data: RoleResponse
  reloadRoles?: () => void
  editRoleModal?: (role: Role) => void
}

const RoleCard: React.FC<RoleCardProps> = ({ data, reloadRoles, editRoleModal }) => {
  const { role, harnessManaged } = data
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const history = useHistory()
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const [menuOpen, setMenuOpen] = useState(false)
  const { mutate: deleteRole } = useDeleteRole({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const { openDialog: openDeleteDialog } = useConfirmationDialog({
    contentText: getString('roleCard.confirmDelete', { name: role.name }),
    titleText: getString('roleCard.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteRole(role.identifier, { headers: { 'content-type': 'application/json' } })
          /* istanbul ignore else */ if (deleted) {
            showSuccess(getString('roleCard.successMessage', { name: role.name }))
            reloadRoles?.()
          } else {
            showError(getString('deleteError'))
          }
        } catch (err) {
          /* istanbul ignore next */
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })
  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setMenuOpen(false)
    editRoleModal?.(role)
  }

  const handleDelete = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    setMenuOpen(false)
    openDeleteDialog()
  }

  return (
    <Card
      className={css.card}
      data-testid={`role-card-${role.identifier}`}
      onClick={() => {
        history.push(
          routes.toRoleDetails({ roleIdentifier: role.identifier, accountId, orgIdentifier, projectIdentifier })
        )
      }}
      interactive
    >
      <CardBody.Menu
        menuContent={
          <Menu>
            <Menu.Item icon="edit" text={getString('edit')} onClick={handleEdit} disabled={harnessManaged} />
            <Menu.Item icon="trash" text={getString('delete')} onClick={handleDelete} disabled={harnessManaged} />
          </Menu>
        }
        menuPopoverProps={{
          className: Classes.DARK,
          isOpen: menuOpen,
          onInteraction: nextOpenState => {
            setMenuOpen(nextOpenState)
          }
        }}
      />

      <Layout.Vertical flex={{ align: 'center-center' }} spacing="large" height="100%">
        <Icon name={getRoleIcon(role.identifier)} size={40} />
        <Text className={css.name} lineClamp={2} color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
          {role.name}
        </Text>
      </Layout.Vertical>
    </Card>
  )
}

export default RoleCard
