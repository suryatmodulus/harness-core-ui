import React, { ReactElement, useState } from 'react'
import { Classes, Menu, Position } from '@blueprintjs/core'
import { Button, Popover } from '@wings-software/uicore'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'

interface FeatureFlagDetailOptionsProps {
  onEdit: () => void
  onArchive: () => void
  onDelete: () => void
  archived: boolean
}

const FeatureFlagDetailOptions = ({
  onEdit,
  onArchive,
  onDelete,
  archived
}: FeatureFlagDetailOptionsProps): ReactElement => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const { getString } = useStrings()

  return (
    <Popover
      isOpen={menuOpen}
      onInteraction={nextOpenState => {
        setMenuOpen(nextOpenState)
      }}
      className={Classes.DARK}
      position={Position.RIGHT_TOP}
    >
      <Button
        minimal
        icon="Options"
        onClick={e => {
          e.stopPropagation()
          setMenuOpen(true)
        }}
      />
      <Menu style={{ minWidth: 'unset' }}>
        <RbacMenuItem
          icon="edit"
          text={getString('edit')}
          onClick={onEdit}
          disabled={archived}
          permission={{
            resource: { resourceType: ResourceType.FEATUREFLAG },
            permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
          }}
        />
        <Menu.Item
          icon="archive"
          text={getString('archive')}
          onClick={onArchive}
          // Disable for now per https://harness.atlassian.net/browse/FFM-772
          disabled={true || archived}
          title={getString('cf.featureNotReady')}
        />
        <Menu.Divider />
        <RbacMenuItem
          icon="trash"
          text={getString('delete')}
          onClick={onDelete}
          permission={{
            resource: { resourceType: ResourceType.FEATUREFLAG },
            permission: PermissionIdentifier.DELETE_FF_FEATUREFLAG
          }}
        />
      </Menu>
    </Popover>
  )
}

export default FeatureFlagDetailOptions
