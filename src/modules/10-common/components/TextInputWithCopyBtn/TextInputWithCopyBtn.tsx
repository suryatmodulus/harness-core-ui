import React from 'react'
import { IFormGroupProps, IInputGroupProps, HTMLInputProps, Popover, Menu } from '@blueprintjs/core'
import { FormInput, Button, Icon, Utils } from '@wings-software/uicore'
import cx from 'classnames'

import { useStrings } from 'framework/exports'
import { toVariableStr } from '@common/utils/StringUtils'

import css from './TextInputWithCopyBtn.module.scss'

export interface ItemNameProps {
  mainText?: string
  secondaryText?: string
}

export function ItemName(props: ItemNameProps): React.ReactElement {
  return (
    <div className={css.nameItem}>
      <div className={css.mainText}>{props.mainText}</div>
      <div className={css.secondaryText}>{props.secondaryText}</div>
    </div>
  )
}

export interface TextInputWithCopyBtnProps extends Omit<IFormGroupProps, 'labelFor'> {
  name: string
  inputGroup?: Omit<IInputGroupProps & HTMLInputProps, 'name' | 'value' | 'onChange' | 'placeholder'>
  placeholder?: string
  onChange?: IInputGroupProps['onChange']
  localName?: string
  fullName?: string
}

export function TextInputWithCopyBtn(props: TextInputWithCopyBtnProps): React.ReactElement {
  const { localName, fullName, disabled, ...rest } = props
  const { getString } = useStrings()

  return (
    <div className={cx(css.textInputWithCopyBtn, { [css.disabled]: disabled })}>
      <FormInput.Text
        {...rest}
        inputGroup={{ disabled }}
        disabled={disabled}
        className={cx(css.input, rest.className)}
      />
      <Popover
        interactionKind="click"
        minimal
        position="bottom-right"
        wrapperTagName="div"
        targetTagName="div"
        className={css.popoverWrapper}
        popoverClassName={css.popover}
      >
        <Button icon="copy-alt" className={css.btn} iconProps={{ size: 12 }} disabled={!localName && !fullName} />
        <Menu className={css.menu}>
          {localName ? (
            <Menu.Item
              className={css.menuItem}
              labelClassName={css.menuItemLabel}
              labelElement={<Icon name="copy-alt" />}
              text={<ItemName mainText={localName} secondaryText={getString('variables.copyVariableName')} />}
              onClick={() => Utils.copy(toVariableStr(localName))}
            />
          ) : null}
          {fullName ? (
            <Menu.Item
              className={css.menuItem}
              labelClassName={css.menuItemLabel}
              labelElement={<Icon name="copy-alt" />}
              text={<ItemName mainText={fullName} secondaryText={getString('variables.copyFqn')} />}
              onClick={() => Utils.copy(toVariableStr(fullName))}
            />
          ) : null}
        </Menu>
      </Popover>
    </div>
  )
}
