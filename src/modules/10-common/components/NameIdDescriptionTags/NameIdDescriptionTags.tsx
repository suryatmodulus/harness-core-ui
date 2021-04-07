import React, { useState } from 'react'
import { Container, FormInput, Icon, Label, Color } from '@wings-software/uicore'
import type { InputWithIdentifierProps } from '@wings-software/uicore/dist/components/InputWithIdentifier/InputWithIdentifier'
import { isEmpty } from 'lodash-es'
import type { ITagInputProps } from '@blueprintjs/core'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/exports'
import type {
  DescriptionComponentProps,
  DescriptionProps,
  FormikForNameIdDescriptionTags,
  NameIdDescriptionProps,
  NameIdDescriptionTagsDeprecatedProps,
  TagsComponentProps,
  TagsDeprecatedComponentProps
} from './NameIdDescriptionTagsConstants'
import css from './NameIdDescriptionTags.module.scss'

export interface NameIdDescriptionTagsProps {
  identifierProps?: Omit<InputWithIdentifierProps, 'formik'>
  descriptionProps?: DescriptionProps
  tagsProps?: Partial<ITagInputProps> & {
    isOption?: boolean
  }
  formikProps: FormikProps<FormikForNameIdDescriptionTags>
  className?: string
}

interface NameIdProps {
  nameLabel?: string // Strong default preference for "Name" vs. Contextual Name (e.g. "Service Name") unless approved otherwise
  identifierProps?: Omit<InputWithIdentifierProps, 'formik'>
}

export const NameId = (props: NameIdProps): JSX.Element => {
  const { getString } = useStrings()
  const { identifierProps, nameLabel = getString('name') } = props
  return <FormInput.InputWithIdentifier inputLabel={nameLabel} {...identifierProps} />
}

export const Description = (props: DescriptionComponentProps): JSX.Element => {
  const { descriptionProps = {}, hasValue } = props
  const { isOptional = true, ...restDescriptionProps } = descriptionProps
  const { getString } = useStrings()
  const [isDescriptionOpen, setDescriptionOpen] = useState<boolean>(hasValue || false)
  const [isDescriptionFocus, setDescriptionFocus] = useState<boolean>(false)

  return (
    <Container style={{ marginBottom: isDescriptionOpen ? '0' : 'var(--spacing-medium)' }}>
      <Label style={{ fontSize: 13, marginBottom: 'var(--spacing-xsmall)' }}>
        {isOptional ? getString('optionalField', { name: getString('description') }) : getString('description')}
        {!isDescriptionOpen && (
          <Icon
            className={css.editOpen}
            data-name="edit"
            data-testid="description-edit"
            size={12}
            name="edit"
            color={Color.GREY_500}
            onClick={() => {
              setDescriptionOpen(true)
              setDescriptionFocus(true)
            }}
          />
        )}
      </Label>
      {isDescriptionOpen && (
        <FormInput.TextArea
          data-name="description"
          autoFocus={isDescriptionFocus}
          name="description"
          {...restDescriptionProps}
        />
      )}
    </Container>
  )
}

const Tags = (props: TagsComponentProps): JSX.Element => {
  const { tagsProps, hasValue, isOptional = true } = props
  const { getString } = useStrings()
  const [isTagsOpen, setTagsOpen] = useState<boolean>(hasValue || false)

  return (
    <Container>
      <Label style={{ fontSize: 13, marginBottom: 'var(--spacing-xsmall)' }}>
        {isOptional ? getString('optionalField', { name: getString('tagsLabel') }) : getString('tagsLabel')}
        {!isTagsOpen && (
          <Icon
            className={css.editOpen}
            data-name="edit"
            data-testid="tags-edit"
            size={12}
            color={Color.GREY_500}
            name="edit"
            onClick={() => {
              setTagsOpen(true)
            }}
          />
        )}
      </Label>
      {isTagsOpen && <FormInput.KVTagInput name="tags" tagsProps={tagsProps} />}
    </Container>
  )
}

function TagsDeprecated(props: TagsDeprecatedComponentProps): JSX.Element {
  const { hasValue } = props
  const { getString } = useStrings()
  const [isTagsOpen, setTagsOpen] = useState<boolean>(hasValue || false)

  return (
    <Container>
      <Label style={{ fontSize: 13, marginBottom: 'var(--spacing-xsmall)' }}>
        {getString('tagsLabel')}
        {!isTagsOpen && (
          <Icon
            className={css.editOpen}
            data-name="edit"
            size={12}
            color={Color.GREY_500}
            name="edit"
            onClick={() => {
              setTagsOpen(true)
            }}
          />
        )}
      </Label>
      {isTagsOpen && (
        <FormInput.TagInput
          name="tags"
          labelFor={name => (typeof name === 'string' ? name : '')}
          itemFromNewTag={newTag => newTag}
          items={[]}
          tagInputProps={{
            noInputBorder: true,
            openOnKeyDown: false,
            showAddTagButton: true,
            showClearAllButton: true,
            allowNewTag: true
          }}
        />
      )}
    </Container>
  )
}

export function NameIdDescriptionTags(props: NameIdDescriptionTagsProps): JSX.Element {
  const { className, identifierProps, descriptionProps, tagsProps, formikProps } = props
  return (
    <Container className={cx(css.main, className)}>
      <NameId identifierProps={identifierProps} />
      <Description descriptionProps={descriptionProps} hasValue={!!formikProps?.values.description} />
      <Tags tagsProps={tagsProps} isOptional={tagsProps?.isOption} hasValue={!isEmpty(formikProps?.values.tags)} />
    </Container>
  )
}

// Requires verification with existing tags
export function NameIdDescriptionTagsDeprecated<T>(props: NameIdDescriptionTagsDeprecatedProps<T>): JSX.Element {
  const { className, identifierProps, descriptionProps, formikProps } = props
  return (
    <Container className={cx(css.main, className)}>
      <NameId identifierProps={identifierProps} />
      <Description descriptionProps={descriptionProps} hasValue={!!formikProps?.values.description} />
      <TagsDeprecated hasValue={!isEmpty(formikProps?.values.tags)} />
    </Container>
  )
}

export function NameIdDescription(props: NameIdDescriptionProps): JSX.Element {
  const { className, identifierProps, descriptionProps, formikProps } = props
  return (
    <Container className={cx(css.main, className)}>
      <NameId identifierProps={identifierProps} />
      <Description descriptionProps={descriptionProps} hasValue={!!formikProps?.values.description} />
    </Container>
  )
}
