import React, { useEffect } from 'react'
import { FormGroup, HTMLDivProps, Intent } from '@blueprintjs/core'
import { isEqual, isEmpty, get, isPlainObject } from 'lodash-es'
import { Button, Card, FormError, Layout } from '@wings-software/uicore'
import type { LayoutProps } from '@wings-software/uicore/dist/layouts/Layout'
import { connect, FormikContext } from 'formik'

export enum CollapsableSelectType {
  CardView = 'CardView'
}

export interface CollapsableSelectOptions {
  value: string | number | symbol
}

export interface CollapsableSelectProps<ObjectType> extends Omit<HTMLDivProps, 'onChange'> {
  selected: (CollapsableSelectOptions & ObjectType) | undefined
  items: Array<CollapsableSelectOptions & ObjectType>
  itemClassName?: string
  renderItem: (item: ObjectType, selected?: CollapsableSelectOptions & ObjectType) => JSX.Element
  onChange?: (selected: CollapsableSelectOptions & ObjectType, e: React.MouseEvent<HTMLDivElement>) => void
  layoutProps?: Partial<LayoutProps>
  name: string
  isReadonly?: boolean
  changeText?: string
  cancelText?: string
  type?: CollapsableSelectType
}

export interface ConnectedCollapsableSelectProps<ObjectType> extends CollapsableSelectProps<ObjectType> {
  formik: FormikContext<Record<string, unknown>>
}
export function CollapsableSelect<ObjectType>(props: ConnectedCollapsableSelectProps<ObjectType>) {
  const {
    className = '',
    itemClassName = '',
    formik,
    name,
    items = [],
    selected,
    renderItem,
    changeText = 'Change',
    cancelText = 'Close',
    layoutProps,
    isReadonly = false,
    type = undefined
  } = props

  const value = get(formik?.values, name)

  const [showAllOptions, setShowAllOptions] = React.useState(!isEmpty(value))

  const errorCheck = (name: string, formik?: FormikContext<any>) =>
    (get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
    get(formik?.errors, name) &&
    !isPlainObject(get(formik?.errors, name))

  const hasError = errorCheck(name, formik)
  const intent = hasError ? Intent.DANGER : Intent.NONE
  const helperText = hasError ? <FormError errorMessage={get(formik?.errors, name)} /> : null

  function handleChangeClick(): void {
    setShowAllOptions(true)
  }

  function handleCancelClick(): void {
    setShowAllOptions(false)
  }

  function handleChange(item: CollapsableSelectOptions & ObjectType, event: React.MouseEvent<HTMLDivElement>): void {
    formik.setFieldValue(name, item.value)
    formik.setFieldTouched(name, true)
    props.onChange?.(item, event)
  }

  useEffect(() => {
    setShowAllOptions(isEmpty(value))
  }, [value])

  const selectedItemIndex = value ? items.findIndex(item => item.value === value) : -1
  let visibleItems =
    selectedItemIndex > -1
      ? [items[selectedItemIndex], ...items.slice(0, selectedItemIndex), ...items.slice(selectedItemIndex + 1)]
      : items

  if (!showAllOptions) {
    visibleItems = visibleItems.slice(0, 1)
  }

  return (
    <FormGroup className={className} helperText={helperText} intent={intent}>
      <Layout.Horizontal spacing={'medium'} {...layoutProps}>
        {visibleItems.length > 0 &&
          visibleItems.map((item, index) => {
            const isSelected = isEqual(item, selected)

            return (
              <React.Fragment key={index}>
                {type === CollapsableSelectType.CardView ? (
                  <Card
                    className={itemClassName}
                    interactive={true}
                    data-index={index}
                    selected={isSelected}
                    cornerSelected={true}
                    onClick={event => handleChange(item, event)}
                  >
                    {renderItem(item, selected)}
                  </Card>
                ) : (
                  <div className={itemClassName} data-index={index} onClick={event => handleChange(item, event)}>
                    {renderItem(item, selected)}
                  </div>
                )}
              </React.Fragment>
            )
          })}

        {showAllOptions ? null : (
          <Button
            style={{ margin: 'auto' }}
            disabled={isReadonly}
            minimal
            icon="Edit"
            iconProps={{ size: 12 }}
            withoutCurrentColor={true}
            intent="primary"
            data-testid="collapsable-select-change"
            onClick={handleChangeClick}
            text={changeText}
          />
        )}
        {showAllOptions && value ? (
          <Button
            style={{ margin: 'auto' }}
            disabled={isReadonly}
            minimal
            icon="cross"
            iconProps={{ size: 12 }}
            withoutCurrentColor={true}
            intent="primary"
            data-testid="thumbnail-select-cancel"
            onClick={handleCancelClick}
            text={cancelText}
          />
        ) : null}
      </Layout.Horizontal>
    </FormGroup>
  )
}

export const FormikCollapsableSelect = connect(CollapsableSelect) as <ObjectType>(
  props: CollapsableSelectProps<ObjectType>
) => React.ReactElement<CollapsableSelectProps<ObjectType>>
