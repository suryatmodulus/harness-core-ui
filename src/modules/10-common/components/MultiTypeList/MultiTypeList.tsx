import React from 'react'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import cx from 'classnames'
import {
  FormInput,
  Card,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  MultiTextInputProps
} from '@wings-software/uicore'
import { FieldArray, connect, FormikContext } from 'formik'
import { get } from 'lodash-es'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'
import MultiTypeFieldSelector, {
  MultiTypeFieldSelectorProps
} from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import css from './MultiTypeList.module.scss'

export type ListValue = { id: string; value: string }[]
export type MultiTypeListType = ListValue | string

interface MultiTypeListConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'> {
  variableName?: ConfigureOptionsProps['variableName']
}

export interface MultiTypeListProps {
  name: string
  placeholder?: string
  multiTypeFieldSelectorProps: Omit<MultiTypeFieldSelectorProps, 'name' | 'defaultValueToReset' | 'children'>
  multiTextInputProps?: Omit<MultiTextInputProps, 'name'>
  enableConfigureOptions?: boolean
  configureOptionsProps?: MultiTypeListConfigureOptionsProps
  formik?: FormikContext<any>
  style?: React.CSSProperties
  disabled?: boolean
}

export const MultiTypeList = (props: MultiTypeListProps): React.ReactElement => {
  const {
    name,
    placeholder,
    multiTypeFieldSelectorProps,
    multiTextInputProps = {},
    enableConfigureOptions = true,
    configureOptionsProps,
    formik,
    disabled,
    ...restProps
  } = props
  const value = get(formik?.values, name, '') as MultiTypeListType

  const { getString } = useStrings()

  return (
    <div className={cx(css.group, css.withoutSpacing)} {...restProps}>
      <MultiTypeFieldSelector
        name={name}
        defaultValueToReset={[{ id: uuid('', nameSpace()), value: '' }]}
        style={{ flexGrow: 1, marginBottom: 0 }}
        {...multiTypeFieldSelectorProps}
        disableTypeSelection={multiTypeFieldSelectorProps.disableTypeSelection || disabled}
      >
        <FieldArray
          name={name}
          render={({ push, remove }) => (
            <Card style={{ width: '100%' }}>
              {Array.isArray(value) &&
                value.map(({ id }, index: number) => (
                  <div className={cx(css.group, css.withoutAligning)} key={id}>
                    <FormInput.MultiTextInput
                      label=""
                      name={`${name}[${index}].value`}
                      placeholder={placeholder}
                      multiTextInputProps={{
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                        ...multiTextInputProps
                      }}
                      style={{ flexGrow: 1 }}
                      disabled={disabled}
                    />
                    <Button
                      icon="main-trash"
                      iconProps={{ size: 20 }}
                      minimal
                      onClick={() => remove(index)}
                      data-testid={`remove-${name}-[${index}]`}
                      disabled={disabled}
                    />
                  </div>
                ))}
              <Button
                intent="primary"
                minimal
                text={getString('plusAdd')}
                data-testid={`add-${name}`}
                onClick={() => push({ id: uuid('', nameSpace()), value: '' })}
                disabled={disabled}
              />
            </Card>
          )}
        />
      </MultiTypeFieldSelector>
      {enableConfigureOptions &&
        typeof value === 'string' &&
        getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={value}
            type={getString('list')}
            variableName={name}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={val => formik?.setFieldValue(name, val)}
            {...configureOptionsProps}
            isReadonly={props.disabled}
          />
        )}
    </div>
  )
}

export default connect(MultiTypeList)
