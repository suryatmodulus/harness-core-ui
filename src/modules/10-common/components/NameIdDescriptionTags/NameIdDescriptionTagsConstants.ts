import type { TagInputProps } from '@wings-software/uicore'
import type { ITagInputProps } from '@blueprintjs/core'
import type { InputWithIdentifierProps } from '@wings-software/uicore/dist/components/InputWithIdentifier/InputWithIdentifier'
import type { FormikProps } from 'formik'
import type { tagsType } from '@common/utils/types'

export interface DescriptionProps {
  placeholder?: string
  isOptional?: boolean
}

export interface FormikForNameIdDescriptionTags {
  name?: string
  identifier?: string
  description?: string
  tags?: tagsType
}

export interface DescriptionComponentProps {
  descriptionProps?: DescriptionProps
  hasValue?: boolean
}

export interface TagsProps {
  className?: string
}

export interface TagsComponentProps {
  tagsProps?: Partial<ITagInputProps>
  hasValue?: boolean
  isOptional?: boolean
}

export interface TagsDeprecatedComponentProps {
  hasValue?: boolean
}

export interface NameIdDescriptionTagsDeprecatedProps<T> {
  identifierProps?: Omit<InputWithIdentifierProps, 'formik'>
  descriptionProps?: DescriptionProps
  tagInputProps?: TagInputProps<T>
  formikProps: FormikProps<FormikForNameIdDescriptionTags>
  className?: string
}

export interface NameIdDescriptionProps {
  identifierProps?: Omit<InputWithIdentifierProps, 'formik'>
  descriptionProps?: DescriptionProps
  className?: string
  formikProps: Omit<FormikProps<FormikForNameIdDescriptionTags>, 'tags'>
}
