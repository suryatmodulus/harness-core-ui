import React from 'react'
import { Avatar, Container, Layout, Text } from '@wings-software/uicore'
import { OptionsMenuButton } from '@common/components'
import { useStrings } from 'framework/exports'
import { DISABLE_AVATAR_PROPS } from '@cf/utils/CFUtils'
import { ItemContainer, ItemContainerProps } from '@cf/components/ItemContainer/ItemContainer'
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
          <OptionsMenuButton
            items={[{ text: getString('cf.targetDetail.removeSegment'), icon: 'cross', onClick: onRemoveClick }]}
          />
        )}
      </Layout.Horizontal>
    </ItemContainer>
  )
}
