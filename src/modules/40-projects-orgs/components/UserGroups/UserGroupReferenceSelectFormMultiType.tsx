// import React, { useEffect } from 'react'
// import { connect } from 'formik'
// import { FormGroup, Intent } from '@blueprintjs/core'
// import { get } from 'lodash-es'
// import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
// import { useGetUserGroup, UserGroupDTO } from 'services/cd-ng'
// import { Scope } from '@common/interfaces/SecretsInterface'
// import { useStrings } from 'framework/exports'
// import { errorCheck } from '@common/utils/formikHelpers'
// import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
// import { MultiTypeReferenceInput } from '@common/components/ReferenceSelect/ReferenceSelect'
// import { getExtraProps } from './UserGroupReferenceSelect'
// import type { MultiTypeUserGroupReferenceSelectProps } from './types'

// export const MultiTypeUserGroupReferenceSelect = (
//   props: MultiTypeUserGroupReferenceSelectProps
// ): React.ReactElement => {
//   const {
//     defaultScope,
//     accountIdentifier,
//     projectIdentifier,
//     orgIdentifier,
//     name,
//     label,
//     selected,
//     onChange,
//     width = 400,
//     formik,
//     placeholder,
//     style,
//     multiTypeProps = {},
//     ...restProps
//   } = props
//   const hasError = errorCheck(name, formik)
//   const {
//     intent = hasError ? Intent.DANGER : Intent.NONE,
//     helperText = hasError ? get(formik?.errors, name) : null,
//     disabled,
//     ...rest
//   } = restProps
//   const scopeFromSelected = typeof selected === 'string' && getScopeFromValue(selected || '')
//   const selectedRef = typeof selected === 'string' && getIdentifierFromValue(selected || '')
//   const [multiType, setMultiType] = React.useState<MultiTypeInputType>(MultiTypeInputType.FIXED)
//   const { data: userGroupData, loading, refetch } = useGetUserGroup({
//     identifier: selectedRef as string,
//     queryParams: {
//       accountIdentifier,
//       orgIdentifier: scopeFromSelected === Scope.ORG || scopeFromSelected === Scope.PROJECT ? orgIdentifier : undefined,
//       projectIdentifier: scopeFromSelected === Scope.PROJECT ? projectIdentifier : undefined
//     },
//     lazy: true
//   })

//   const [selectedValue, setSelectedValue] = React.useState(selected)

//   useEffect(() => {
//     if (
//       typeof selected == 'string' &&
//       multiType === MultiTypeInputType.FIXED &&
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
//   const { getString } = useStrings()

//   const placeHolderLocal = loading ? getString('loading') : placeholder

//   const component = (
//     <FormGroup
//       {...rest}
//       labelFor={name}
//       helperText={helperText}
//       intent={intent}
//       style={{ marginTop: 'var(--spacing-xsmall)' }}
//     >
//       <MultiTypeReferenceInput<UserGroupDTO>
//         name={name}
//         referenceSelectProps={{
//           ...getExtraProps({
//             defaultScope,
//             accountIdentifier,
//             projectIdentifier,
//             orgIdentifier,
//             name,
//             selected: selectedValue,
//             width,
//             placeholder: placeHolderLocal,
//             label,
//             getString
//           }),
//           disabled: loading || disabled
//         }}
//         onChange={(val, valueType, type1) => {
//           setMultiType(type1)
//           onChange?.(val, valueType, type1)
//         }}
//         value={selected}
//         {...multiTypeProps}
//       />
//     </FormGroup>
//   )

//   return (
//     <div style={style}>
//       {label}
//       {component}
//     </div>
//   )
// }

// export const UserGroupReferenceSelectFormMultiType = connect(MultiTypeUserGroupReferenceSelect)
