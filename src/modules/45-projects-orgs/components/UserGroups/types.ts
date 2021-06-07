// import type { IFormGroupProps } from '@blueprintjs/core'
// import type { FormikContext } from 'formik'
// import type { ExpressionAndRuntimeTypeProps } from '@wings-software/uicore'
// import type { MultiTypeReferenceInputProps } from '@common/components/ReferenceSelect/ReferenceSelect'
// import type { Scope } from '@common/interfaces/SecretsInterface'
// import type { UserGroupDTO } from 'services/cd-ng'

// export interface AdditionalParamsUG {
//   projectIdentifier?: string
//   orgIdentifier?: string
// }

// export interface UserGroupSelectedValue {
//   label: string
//   value: string
//   scope: Scope
//   identifier: string
// }
// export interface UserGroupReferenceSelectProps extends Omit<IFormGroupProps, 'label'> {
//   accountIdentifier: string
//   name: string
//   placeholder: string
//   label: string | React.ReactElement
//   projectIdentifier?: string
//   selected?: UserGroupSelectedValue | string
//   onChange?: (userGroup: UserGroupDTO, scope: Scope) => void
//   orgIdentifier?: string
//   defaultScope?: Scope
//   width?: number
//   error?: string
//   getString(key: string, vars?: Record<string, any>): string
// }

// export interface MultiTypeUserGroupReferenceSelectProps extends Omit<UserGroupReferenceSelectProps, 'onChange'> {
//   onChange?: ExpressionAndRuntimeTypeProps['onChange']
//   formik?: FormikContext<any>
//   multiTypeProps?: Omit<MultiTypeReferenceInputProps<UserGroupDTO>, 'name' | 'referenceSelectProps'>
//   style?: React.CSSProperties
// }
