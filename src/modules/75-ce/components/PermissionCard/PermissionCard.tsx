import React from 'react'
import { Button, Card, Color, Icon, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import css from './PermissionCard.module.scss'

interface PermissionCardProps {
  preTitle: string
  title: string
  description: string
  enabled: boolean
  onSelect: () => void
}

const PermissionCard: React.FC<PermissionCardProps> = props => {
  const { preTitle, title, description, enabled, onSelect } = props
  const { getString } = useStrings()
  return (
    <Card elevation={0} className={css.card}>
      <Layout.Horizontal spacing="small">
        <Icon name="main-search" size={30} />
        <div>
          <Text font="small">{preTitle}</Text>
          <Text padding={{ bottom: 'small' }} color={Color.BLACK} style={{ fontSize: '13px' }}>
            {title}
          </Text>
        </div>
      </Layout.Horizontal>

      <Text font="small" className={css.description}>
        {description}
      </Text>
      <Layout.Horizontal spacing="xxlarge" style={{ float: 'right' }}>
        {!enabled && (
          <Button font={{ size: 'small', weight: 'semi-bold' }} className={css.enable} onClick={onSelect}>
            {getString('enable')}
          </Button>
        )}
        {enabled && (
          <Button
            font={{ size: 'small', weight: 'semi-bold' }}
            className={css.enabled}
            onClick={onSelect}
            rightIcon="small-tick"
          >
            {getString('enabledLabel')}
          </Button>
        )}
      </Layout.Horizontal>
    </Card>
  )
}

export default PermissionCard
