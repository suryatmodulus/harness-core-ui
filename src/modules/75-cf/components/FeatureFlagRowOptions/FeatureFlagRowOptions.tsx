import React, { ReactElement, useState } from 'react'
import { Classes, Menu, Position } from '@blueprintjs/core'
import { Button, Popover } from '@wings-software/uicore'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'

interface FeatureFlagRowOptionsProps {
  onEdit: () => void
  onDelete: () => void
}

const FeatureFlagRowOptions = ({ onEdit, onDelete }: FeatureFlagRowOptionsProps): ReactElement => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const { getString } = useStrings()
  const { activeEnvironment } = useActiveEnvironment()

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
          permission={{
            resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
            permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
          }}
        />
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

export default FeatureFlagRowOptions
