import React from 'react'
import {
  Button,
  ExpressionAndRuntimeTypeProps,
  ExpressionAndRuntimeType,
  MultiTypeInputValue,
  Layout,
  Text,
  Color,
  FixedTypeComponentProps,
  MultiTypeInputType
} from '@wings-software/uicore'
import { Classes, Dialog, Tabs, Tab } from '@blueprintjs/core'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import type { Scope } from '@common/interfaces/SecretsInterface'
import { EntityReferenceProps, EntityReference } from '../EntityReference/EntityReference'
import css from './ReferenceSelect.module.scss'
export interface MinimalObject {
  identifier?: string
  name?: string
}
export interface Item {
  label: string
  value: string
  scope: Scope
}
export interface ReferenceSelectProps<T extends MinimalObject> extends Omit<EntityReferenceProps<T>, 'onSelect'> {
  name: string
  placeholder: string
  selectAnReferenceLabel: string
  selected?: Item
  createNewLabel?: string
  createNewHandler?: () => void
  hideModal?: boolean
  selectedRenderer?: JSX.Element
  editRenderer?: JSX.Element
  width?: number
  isNewConnectorLabelVisible?: boolean
  onChange: (record: T, scope: Scope) => void
  disabled?: boolean
}
export function ReferenceSelect<T extends MinimalObject>(props: ReferenceSelectProps<T>): JSX.Element {
  const {
    name,
    placeholder,
    selected,
    onChange,
    width = 300,
    createNewLabel,
    createNewHandler,
    isNewConnectorLabelVisible = true,
    editRenderer,
    hideModal = false,
    selectedRenderer,
    disabled,
    ...referenceProps
  } = props
  const [isOpen, setOpen] = React.useState(false)
  React.useEffect(() => {
    isOpen && setOpen(!hideModal) //this will hide modal if hideModal changes to true in open state
  }, [hideModal])
  return (
    <>
      <Button
        minimal
        data-testid={`cr-field-${name}`}
        className={css.container}
        style={{ width }}
        withoutCurrentColor={true}
        rightIcon="caret-down"
        disabled={disabled}
        onClick={e => {
          if (disabled) {
            e.preventDefault()
          } else {
            setOpen(true)
          }
        }}
      >
        {selected ? selectedRenderer || selected.label : <span className={css.placeholder}>{placeholder}</span>}
      </Button>
      <Dialog
        isOpen={isOpen}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => setOpen(false)}
        className={css.dialog}
      >
        <div className={cx(css.contentContainer)}>
          {editRenderer && selected && selected.value && (
            <Layout.Horizontal
              padding="medium"
              style={{
                borderBottom: '1px solid var(--grey-250)',
                paddingTop: '0',
                paddingRight: 'var(--spacing-large)',
                marginBottom: 'var(--spacing-small)'
              }}
            >
              {editRenderer}
              <Button onClick={() => setOpen(false)} className={css.closeButton} icon="cross" minimal />
            </Layout.Horizontal>
          )}
          {createNewLabel && createNewHandler && isNewConnectorLabelVisible && (
            <>
              <Layout.Horizontal
                style={{
                  borderBottom: '1px solid var(--grey-250)',
                  paddingBottom: 'var(--spacing-small)'
                }}
                className={Classes.POPOVER_DISMISS}
              >
                <Button
                  minimal
                  onClick={() => {
                    createNewHandler?.()
                  }}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <Text color={Color.PRIMARY_7}>+ {createNewLabel}</Text>
                </Button>
                <Button onClick={() => setOpen(false)} className={css.closeButton} icon="cross" minimal />
              </Layout.Horizontal>
            </>
          )}
          {isEmpty(selected) && !isNewConnectorLabelVisible ? (
            <>
              <Tabs id={'Select'}>
                <Tab
                  id={'reference'}
                  title={<Text padding={'medium'}>{props.selectAnReferenceLabel}</Text>}
                  panel={
                    <EntityReference<T>
                      {...referenceProps}
                      onSelect={(record, scope) => {
                        setOpen(false)
                        onChange(record, scope)
                      }}
                    />
                  }
                />
              </Tabs>
              <Button onClick={() => setOpen(false)} className={css.closeButton} icon="cross" minimal />
            </>
          ) : (
            <EntityReference<T>
              {...referenceProps}
              onSelect={(record, scope) => {
                setOpen(false)
                onChange(record, scope)
              }}
            />
          )}
        </div>
      </Dialog>
    </>
  )
}
export interface MultiTypeReferenceInputProps<T extends MinimalObject>
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps'> {
  referenceSelectProps: Omit<ReferenceSelectProps<T>, 'onChange'>
}
function MultiTypeReferenceInputFixedTypeComponent<T extends MinimalObject>(
  props: FixedTypeComponentProps & MultiTypeReferenceInputProps<T>['referenceSelectProps']
): React.ReactElement {
  const { onChange, selected, width = 300, ...restProps } = props
  return (
    <ReferenceSelect
      {...restProps}
      selected={selected}
      width={width - 28}
      onChange={(record, scope) => {
        onChange?.({ record, scope } as any, MultiTypeInputValue.SELECT_OPTION, MultiTypeInputType.FIXED)
      }}
    />
  )
}
export function MultiTypeReferenceInput<T extends MinimalObject>(props: MultiTypeReferenceInputProps<T>): JSX.Element {
  const { referenceSelectProps, ...rest } = props
  return (
    <ExpressionAndRuntimeType<MultiTypeReferenceInputProps<T>['referenceSelectProps']>
      width={referenceSelectProps.width}
      {...rest}
      fixedTypeComponentProps={referenceSelectProps}
      fixedTypeComponent={MultiTypeReferenceInputFixedTypeComponent}
    />
  )
}
