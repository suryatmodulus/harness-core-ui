import React, { ReactNode } from 'react'
import { Menu } from '@blueprintjs/core'
import type { ItemRenderer } from '@blueprintjs/select'
import {
  IconName,
  Layout,
  MultiSelectOption,
  Text,
  Avatar,
  Color,
  ModalErrorHandlerBinding
} from '@wings-software/uicore'
import type { StringsMap } from 'stringTypes'
import type { ResponseListInviteOperationResponse } from 'services/cd-ng'

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

interface HandleInvitationResponse {
  responseType: Pick<ResponseListInviteOperationResponse, 'data'>
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
  showSuccess: (message: string | ReactNode, timeout?: number, key?: string) => void
  modalErrorHandler?: ModalErrorHandlerBinding
  onSubmit?: () => void
}

export const handleInvitationResponse = ({
  responseType,
  getString,
  showSuccess,
  modalErrorHandler,
  onSubmit
}: HandleInvitationResponse): void => {
  switch (responseType) {
    case 'USER_INVITED_SUCCESSFULLY': {
      onSubmit?.()
      return showSuccess(getString('rbac.usersPage.invitationSuccess'))
    }
    case 'USER_ALREADY_ADDED':
      return showSuccess(getString('rbac.usersPage.userAlreadyAdded'))
    case 'USER_ALREADY_INVITED':
      return showSuccess(getString('rbac.usersPage.userAlreadyInvited'))
    case 'ACCOUNT_INVITE_ACCEPTED':
      return showSuccess(getString('rbac.usersPage.userAccountInvite'))
    default:
      return modalErrorHandler?.showDanger(getString('rbac.usersPage.invitationError'))
  }
}
