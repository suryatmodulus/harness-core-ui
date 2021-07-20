import React from 'react'
import { useParams } from 'react-router-dom'
import { Text, Container, Layout, Color, AvatarGroup } from '@wings-software/uicore'
import { Failure, UserGroupDTO, getUserGroupAggregateListPromise, UserMetadataDTO } from 'services/cd-ng'
import { EntityReference } from '@common/exports'
import type { EntityReferenceResponse } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import css from './UserGroupsReference.module.scss'

export interface UserGroupsRef extends Omit<UserGroupDTO, 'users'> {
  users: UserMetadataDTO[]
}

export interface UserGroupsReferenceProps {
  onSelect: (userGroups: UserGroupDTO[]) => void
  onCancel: () => void
  userGroups?: UserGroupDTO[]
  scope?: Scope
  mock?: UserGroupDTO[]
}

// TODO: modify to fetch groups based on scope
const fetchRecords = (
  scope: Scope,
  search: string | undefined,
  done: (records: EntityReferenceResponse<UserGroupsRef>[]) => void,
  accountIdentifier: string,
  projectIdentifier?: string,
  orgIdentifier?: string
): void => {
  getUserGroupAggregateListPromise({
    queryParams: {
      accountIdentifier,
      projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
      orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined,
      searchTerm: search?.trim()
    }
  })
    .then(responseData => {
      if (responseData?.data?.content) {
        const userGroupsAggregate = responseData.data.content
        const response: EntityReferenceResponse<UserGroupsRef>[] = []
        userGroupsAggregate.forEach(aggregate => {
          /* UserMetadataDTO always returns 6 latest added users,
           * so we need to check if the users in UserGroupDTO and UserMetadataDTO lengths don't match,
           * and add the missing ones, just for count sake, if so
           */
          const usersMeta = [...((aggregate.users as UserMetadataDTO[]) || [])]
          const userUuids = [...((aggregate.userGroupDTO.users as string[]) || [])]
          if (usersMeta.length !== userUuids.length) {
            userUuids.forEach(el => {
              if (usersMeta.findIndex(_el => _el.uuid === el) === -1) {
                usersMeta.push({ name: el, email: el, uuid: el })
              }
            })
          }
          response.push({
            name: aggregate.userGroupDTO.name || '',
            identifier: aggregate.userGroupDTO.identifier || '',
            record: { ...aggregate.userGroupDTO, users: usersMeta }
          })
        })
        done(response)
      } else {
        done([])
      }
    })
    .catch((err: Failure) => {
      throw err.message
    })
}

const SecretReference: React.FC<UserGroupsReferenceProps> = props => {
  const { scope = Scope.ACCOUNT, onCancel, onSelect } = props
  // const { mock, scope = Scope.ACCOUNT, userGroups } = props
  const { getString } = useStrings()
  // TODO: check if this is ok. Can user group have different project and org id`s from the pages params?
  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  return (
    <EntityReference<UserGroupsRef>
      className={css.main}
      onSelect={() => {
        // not needed in multiSelect but is required by EntityReference
      }}
      onCancel={onCancel}
      onMultiSelect={data => {
        const groupsDTO = data.map(group => {
          const mappedUserIds = group.users.map(user => {
            return user.uuid
          })
          return { ...group, users: mappedUserIds }
        })
        onSelect(groupsDTO)
      }}
      defaultScope={scope}
      fetchRecords={(fetchScope, search = '', done) => {
        fetchRecords(fetchScope, search, done, accountIdentifier, projectIdentifier, orgIdentifier)
        // fetchRecords(fetchScope, search, done, accountIdentifier, projectIdentifier, orgIdentifier, mock)
      }}
      projectIdentifier={projectIdentifier}
      orgIdentifier={orgIdentifier}
      noRecordsText={getString('noData')}
      // selectedItems={userGroups}
      allowMultiSelect
      recordRender={({ item, selected }) => {
        const avatars =
          item.record.users?.map(user => {
            return { email: user.email, name: user.name }
          }) || []
        return (
          <Container flex={{ justifyContent: 'space-between' }} width={'100%'}>
            <Layout.Vertical>
              <Text
                width={160}
                lineClamp={1}
                font={{ weight: 'semi-bold' }}
                color={selected ? Color.BLUE_600 : Color.BLACK}
              >
                {item.name}
              </Text>
              <Text width={160} lineClamp={1} font={{ size: 'small' }}>
                {item.record.identifier}
              </Text>
            </Layout.Vertical>
            <AvatarGroup avatars={avatars} restrictLengthTo={6} />
          </Container>
        )
      }}
    />
  )
}

export default SecretReference
