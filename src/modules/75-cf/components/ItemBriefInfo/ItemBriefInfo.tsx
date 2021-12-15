import React from 'react'
import { Avatar, Container, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { DISABLE_AVATAR_PROPS } from '@cf/utils/CFUtils'
import { ItemContainer, ItemContainerProps } from '@cf/components/ItemContainer/ItemContainer'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@common/interfaces/ResourceInterface'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import css from './ItemBriefInfo.module.scss'

interface ItemBriefInfoProps extends ItemContainerProps {
  name: string
  description: string
  onRemoveClick?: () => void
  noAvatar?: boolean
  disabled?: boolean
}

export const ItemBriefInfo: React.FC<ItemBriefInfoProps> = ({
  name,
  description,
  onRemoveClick,
  noAvatar,
  disabled,
  ...props
}) => {
  const { getString } = useStrings()
  const { activeEnvironment } = useActiveEnvironment()

  return (
    <ItemContainer style={{ paddingRight: 'var(--spacing-xsmall)' }} {...props}>
      <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }}>
        {noAvatar !== true && (
          <Avatar
            name={name}
            {...DISABLE_AVATAR_PROPS}
            style={{ transform: 'scale(1.3)', cursor: 'default' }}
            className={css.avatar}
          />
        )}
        <Container style={{ flexGrow: 1 }} padding={{ left: 'xsmall' }}>
          <Text
            margin={{ bottom: description?.length ? 'xsmall' : undefined }}
            style={{
              color: disabled ? 'var(--grey-400)' : '#22222A',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px'
            }}
          >
            {name}
          </Text>
          <Text style={{ color: disabled ? 'var(--grey-350)' : '#22222ac7', fontSize: '12px' }}>{description}</Text>
        </Container>
        {onRemoveClick && (
          <RbacOptionsMenuButton
            items={[
              {
                text: getString('cf.targetDetail.removeSegment'),
                icon: 'cross',
                onClick: onRemoveClick,
                permission: {
                  resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
                  permission: PermissionIdentifier.EDIT_FF_TARGETGROUP
                }
              }
            ]}
          />
        )}
      </Layout.Horizontal>
    </ItemContainer>
  )
}
