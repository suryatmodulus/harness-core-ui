// import React, { useEffect } from 'react'
// import { isEmpty } from 'lodash-es'
// import { FormGroup, Intent } from '@blueprintjs/core'
// import { Layout, Icon, Color, Text, getMultiTypeFromValue, MultiTypeInputType, Avatar } from '@wings-software/uicore'
// import {
//   Failure,
//   ResponsePageUserGroupDTO,
//   UserGroupDTO,
//   GetUserGroupListQueryParams,
//   getUserGroupListPromise,
//   useGetUserGroup
// } from 'services/cd-ng'
// import {
//   EntityReferenceResponse,
//   getIdentifierFromValue,
//   getScopeFromValue
// } from '@common/components/EntityReference/EntityReference'
// import { Scope } from '@common/interfaces/SecretsInterface'
// import { useStrings } from 'framework/exports'
// import { ReferenceSelect, ReferenceSelectProps } from '@common/components/ReferenceSelect/ReferenceSelect'
// import { getAdditionalParamsForUGs } from './helper'
// import type { UserGroupReferenceSelectProps, UserGroupSelectedValue } from './types'
// import css from './UserGroupReferenceSelect.module.scss'

// export function getExtraProps({
//   defaultScope,
//   accountIdentifier,
//   projectIdentifier,
//   orgIdentifier,
//   name,
//   width,
//   selected,
//   placeholder,
//   getString
// }: UserGroupReferenceSelectProps): Omit<ReferenceSelectProps<UserGroupDTO>, 'onChange'> {
//   return {
//     name,
//     width,
//     selectAnReferenceLabel: getString('authenticationSettings.selectUserGroup'),
//     selected: isEmpty(selected) ? undefined : (selected as UserGroupSelectedValue),
//     placeholder,
//     defaultScope,
//     recordClassName: css.ugRecord,
//     fetchRecords: (scope, search = '', done) => {
//       const additionalParams = getAdditionalParamsForUGs(scope, projectIdentifier, orgIdentifier)
//       const queryParams: GetUserGroupListQueryParams = {
//         accountIdentifier,
//         ...additionalParams
//       }
//       if (search) {
//         queryParams.searchTerm = search
//       }
//       const promise: Promise<ResponsePageUserGroupDTO> = getUserGroupListPromise({ queryParams })
//       return promise
//         .then(responseData => {
//           if (responseData.data) {
//             const userGroups = responseData.data.content || []
//             const response: EntityReferenceResponse<UserGroupDTO>[] = []
//             userGroups.forEach(userGroup => {
//               response.push({
//                 name: userGroup.name || '',
//                 identifier: userGroup.identifier || '',
//                 record: userGroup
//               })
//             })
//             done(response)
//           } else {
//             done([])
//           }
//         })
//         .catch((err: Failure) => {
//           throw err.message
//         })
//     },
//     projectIdentifier,
//     orgIdentifier,
//     noRecordsText: getString('noUserGroupsFound'),
//     recordRender: function renderItem(item, checked) {
//       return (
//         <>
//           <Layout.Horizontal key={item.name.toString()} spacing="small" className={css.ugRecordLabel}>
//             <Avatar email={item.name.toString()} size="xsmall" hoverCard={false} />
//             <Text>{item.name}</Text>
//             <Text font={{ size: 'small', weight: 'light' }} color={Color.GREY_450}>
//               {item.identifier}
//             </Text>
//           </Layout.Horizontal>
//           {checked ? <Icon name="pipeline-approval" /> : null}
//         </>
//       )
//     }
//   }
// }

// export const UserGroupReferenceSelect: React.FC<UserGroupReferenceSelectProps> = props => {
//   const {
//     defaultScope,
//     accountIdentifier,
//     projectIdentifier,
//     orgIdentifier,
//     name,
//     selected,
//     label,
//     width = 400,
//     placeholder,
//     error,
//     disabled,
//     ...rest
//   } = props

//   const [selectedValue, setSelectedValue] = React.useState(selected)

//   const scopeFromSelected = typeof selected === 'string' && getScopeFromValue(selected || '')
//   const selectedRef = typeof selected === 'string' && getIdentifierFromValue(selected || '')
//   const { data: userGroupData, loading, refetch } = useGetUserGroup({
//     identifier: selectedRef as string,
//     queryParams: {
//       accountIdentifier,
//       orgIdentifier: scopeFromSelected === Scope.ORG || scopeFromSelected === Scope.PROJECT ? orgIdentifier : undefined,
//       projectIdentifier: scopeFromSelected === Scope.PROJECT ? projectIdentifier : undefined
//     },
//     lazy: true
//   })

//   useEffect(() => {
//     if (
//       typeof selected == 'string' &&
//       getMultiTypeFromValue(selected) === MultiTypeInputType.FIXED &&
//       selected.length > 0
//     ) {
//       refetch()
//     } else {
//       setSelectedValue(selected)
//     }
//   }, [selected])

//   useEffect(() => {
//     if (
//       typeof selected === 'string' &&
//       getMultiTypeFromValue(selected) === MultiTypeInputType.FIXED &&
//       userGroupData &&
//       userGroupData?.data?.name &&
//       !loading
//     ) {
//       const scope = getScopeFromValue(selected || '')
//       const value = {
//         label: userGroupData.data.name,
//         value:
//           scope === Scope.ORG || scope === Scope.ACCOUNT
//             ? `${scope}.${userGroupData?.data?.identifier}`
//             : userGroupData.data.identifier || '',
//         scope,
//         identifier: userGroupData.data.identifier || ''
//       }
//       setSelectedValue(value)
//     }
//   }, [userGroupData?.data?.name, loading, selected, defaultScope, userGroupData, userGroupData?.data?.identifier, name])

//   const helperText = error ? error : undefined
//   const intent = error ? Intent.DANGER : Intent.NONE
//   const { getString } = useStrings()
//   const placeHolderLocal = loading ? getString('loading') : placeholder

//   return (
//     <FormGroup {...rest} label={label} helperText={helperText} intent={intent}>
//       <ReferenceSelect<UserGroupDTO>
//         onChange={(userGroup, scope) => {
//           props.onChange?.(userGroup, scope)
//         }}
//         {...getExtraProps({
//           defaultScope,
//           accountIdentifier,
//           projectIdentifier,
//           orgIdentifier,
//           name,
//           selected: selectedValue,
//           width,
//           placeholder: placeHolderLocal,
//           label,
//           getString
//         })}
//         disabled={disabled || loading}
//       />
//     </FormGroup>
//   )
// }
