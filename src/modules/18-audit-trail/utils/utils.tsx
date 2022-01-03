import React from 'react'
import { Menu } from '@blueprintjs/core'
import type { ItemRenderer } from '@blueprintjs/select'
import { Layout, Text, Avatar, Color, MultiSelectOption } from '@wings-software/uicore'
import { isEmail } from '@common/utils/Validation'

export interface UserItem extends MultiSelectOption {
  email?: string
}

export const UserItemRenderer: ItemRenderer<UserItem> = (item, { handleClick }) => (
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

export const UserTagRenderer = (item: UserItem, validate = false): React.ReactNode => (
  <Layout.Horizontal key={item.value.toString()} flex spacing="small">
    <Avatar name={item.label} email={item.value.toString()} size="xsmall" hoverCard={false} />
    <Text color={validate && !isEmail(item.value.toString().toLowerCase()) ? Color.RED_500 : Color.BLACK}>
      {item.label}
    </Text>
  </Layout.Horizontal>
)
