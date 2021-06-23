import { Menu } from '@blueprintjs/core'
import type { ItemRenderer } from '@blueprintjs/select'
import { IconName, Layout, MultiSelectOption, Text, Avatar, Color } from '@wings-software/uicore'
import React from 'react'

export interface UserItem extends MultiSelectOption {
  email?: string
}

export const getRoleIcon = (roleIdentifier: string): IconName => {
  switch (roleIdentifier) {
    case '_account_viewer':
    case '_organization_viewer':
    case '_project_viewer':
      return 'viewerRole'
    case '_account_admin':
    case '_organization_admin':
    case '_project_admin':
      return 'adminRole'
    default:
      return 'customRole'
  }
}

export const UserTagRenderer = (item: UserItem): React.ReactNode => (
  <Layout.Horizontal key={item.value.toString()} flex spacing="small">
    <Avatar name={item.label} size="xsmall" hoverCard={false} />
    <Text>{item.label}</Text>
  </Layout.Horizontal>
)

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
