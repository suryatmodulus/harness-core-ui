import React from 'react'
import { Layout, Text, Avatar, Color } from '@wings-software/uicore'
import { isEmail } from '@common/utils/Validation'
import type { UserItem } from '../UserItemRenderer/UserItemRenderer'

interface UserItemRendererProps {
  item: UserItem
  validate?: boolean
}

const UserItemRenderer: React.FC<UserItemRendererProps> = ({ item, validate = false }) => {
  return (
    <Layout.Horizontal key={item.value.toString()} flex spacing="small">
      <Avatar name={item.label} email={item.value.toString()} size="xsmall" hoverCard={false} />
      <Text color={validate && !isEmail(item.value.toString().toLowerCase()) ? Color.RED_500 : Color.BLACK}>
        {item.label}
      </Text>
    </Layout.Horizontal>
  )
}

export default UserItemRenderer
