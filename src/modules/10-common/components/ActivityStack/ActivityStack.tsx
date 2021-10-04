import React from 'react'
import { Color, Icon, Layout, Text, Popover, IconName } from '@wings-software/uicore'
import { Classes, PopoverInteractionKind } from '@blueprintjs/core'
import css from './ActivityStack.module.scss'

export interface ActivityStackItems {
  name: string
  icon: IconName
  color: string
  lastUpdatedAt: string
  activity?: string
  updatedBy?: string
}

interface ActivityStackProps {
  items: ActivityStackItems[]
  tooltip: (item: ActivityStackItems) => void
}

const ActivityStack: React.FC<ActivityStackProps> = ({ items, tooltip }) => {
  return (
    <>
      {items.map((value: ActivityStackItems, index: number) => (
        <>
          <div>
            <Popover interactionKind={PopoverInteractionKind.HOVER} boundary="viewport" popoverClassName={Classes.DARK}>
              <div>
                <Layout.Horizontal className={css.alignCenter}>
                  <div className={css.circle} style={{ backgroundColor: value.color }}>
                    <Icon name={value.icon} className={css.icon} />
                  </div>
                  <Layout.Vertical padding="xsmall">
                    <Text font="normal" color={Color.BLACK}>
                      {value.name}
                    </Text>
                    <Text font="small">{value.lastUpdatedAt}</Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
              </div>
              {tooltip(value)}
            </Popover>
          </div>
          {index != items.length - 1 ? <div className={css.connector} /> : null}
        </>
      ))}
    </>
  )
}

export default ActivityStack
