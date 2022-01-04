import React, { MouseEventHandler } from 'react'
import { Layout, Text, Avatar, Color, MultiSelectOption } from '@wings-software/uicore'
import { Menu } from '@blueprintjs/core'

export interface UserItem extends MultiSelectOption {
  email?: string
}

interface UserItemRendererProps {
  item: UserItem
  handleClick: MouseEventHandler<HTMLElement>
}

const UserItemRenderer: React.FC<UserItemRendererProps> = ({ handleClick, item }) => {
  return (
    <Menu.Item
      key={item.value.toString()}
      text={
        <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
          <Avatar name={item.label} email={item.email || item.value.toString()} size="small" hoverCard={false} />
          <Layout.Vertical padding={{ left: 'small' }}>
            <Text color={Color.BLACK}>{item.label}</Text>
            <Text color={Color.GREY_700}>{item.email || item.value}</Text>
          </Layout.Vertical>
        </Layout.Horizontal>
      }
      onClick={handleClick}
    />
  )
}

export default UserItemRenderer
