import React, { useState, useEffect } from 'react'
import { Container, Color, Icon, Text, Collapse, IconName } from '@wings-software/uicore'
import moment from 'moment'
import type { VerificationResult } from 'services/cv'
import styles from './DeploymentGroupList.module.scss'

export interface DeploymentItemProps {
  name: string
  environment: string
  startedOn: number
  status: VerificationResult['status']
  onClick(): void
  selected: boolean
}

const mapItemColor = (status: VerificationResult['status']): Color => {
  switch (status) {
    case 'IN_PROGRESS':
      return Color.BLUE_500
    case 'VERIFICATION_PASSED':
      return Color.GREEN_500
    case 'VERIFICATION_FAILED':
    case 'ERROR':
      return Color.RED_500
    default:
      return Color.GREY_300
  }
}

const mapItemIcon = (status: DeploymentItemProps['status']): IconName => {
  switch (status) {
    case 'VERIFICATION_PASSED':
      return 'small-tick'
    case 'VERIFICATION_FAILED':
    case 'ERROR':
      return 'issue'
    default:
      return 'pie-chart'
  }
}

export interface DeploymentGroupListProps {
  name: string
  defaultOpen?: boolean
  items?: Array<DeploymentItemProps>
}

export default function DeploymentGroupList({ name, defaultOpen, items }: DeploymentGroupListProps) {
  const [open, setOpen] = useState(!!defaultOpen)

  useEffect(() => {
    if (items?.find(i => i.selected) && !open) {
      setOpen(true)
    }
  }, [items])

  return (
    <Collapse
      collapseClassName={styles.main}
      heading={
        <Text margin={{ left: 'small' }} font={{ weight: open ? 'bold' : 'light' }}>
          {name}
        </Text>
      }
      isOpen={open}
      onToggleOpen={setOpen}
    >
      {items?.map((item, i) => (
        <Container
          key={item.name + i}
          onClick={item.onClick}
          className={styles.item}
          background={item.selected ? Color.BLUE_200 : undefined}
          padding="small"
        >
          <Container className={styles.itemHeader}>
            <Text width={130} color={Color.BLACK}>
              {item.name}
            </Text>
            <Icon
              margin={{ left: 'medium' }}
              size={12}
              background={mapItemColor(item.status)}
              color={Color.WHITE}
              name={mapItemIcon(item.status)}
            />
          </Container>
          <Text font={{ size: 'small' }}>{`Environment: ${item.environment}`}</Text>
          <Text font={{ size: 'small' }}>{`Started on: ${moment(item.startedOn).format('MMM D, YYYY h:mm A')}`}</Text>
        </Container>
      ))}
    </Collapse>
  )
}
