import React from 'react'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import cx from 'classnames'
import {
  MultiTextInput,
  Card,
  Intent,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  MultiTextInputProps
} from '@wings-software/uicore'
import { connect, FormikContext } from 'formik'
import { get, isEmpty } from 'lodash-es'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'
import MultiTypeFieldSelector, {
  MultiTypeFieldSelectorProps
} from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import css from './MultiTypeListInputSet.module.scss'

export type ListType = string[] | { [key: string]: string }[]
export type MultiTypeListType = ListType | string

export type ListUIType = { id: string; value: string }[]
export type MultiTypeListUIType = ListUIType | string

interface MultiTypeListConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'> {
  variableName?: ConfigureOptionsProps['variableName']
}

export interface MultiTypeListProps {
  name: string
  placeholder?: string
  withObjectStructure?: boolean
  keyName?: string
  multiTypeFieldSelectorProps: Omit<MultiTypeFieldSelectorProps, 'name' | 'defaultValueToReset' | 'children'>
  multiTextInputProps?: Omit<MultiTextInputProps, 'name'>
  enableConfigureOptions?: boolean
  configureOptionsProps?: MultiTypeListConfigureOptionsProps
  formik?: FormikContext<any>
  style?: React.CSSProperties
  disabled?: boolean
}

const generateNewValue: () => { id: string; value: string } = () => ({
  id: uuid('', nameSpace()),
  value: ''
})

export const MultiTypeListInputSet = (props: MultiTypeListProps): React.ReactElement => {
  const {
    name,
    placeholder,
    withObjectStructure,
    keyName,
    multiTypeFieldSelectorProps,
    multiTextInputProps = {},
    enableConfigureOptions = true,
    configureOptionsProps,
    formik,
    disabled,
    ...restProps
  } = props

  const { getString } = useStrings()

  const [value, setValue] = React.useState<ListUIType>(() => {
    const initialValue = get(formik?.values, name, '') as ListType
    const initialValueInCorrectFormat = (initialValue || []).map((item: string | { [key: string]: string }) => ({
      id: uuid('', nameSpace()),
      value: withObjectStructure && keyName ? ((item as { [key: string]: string })[keyName] as string) : item
    })) as ListUIType

    // Adding a default value
    if (Array.isArray(initialValueInCorrectFormat) && initialValueInCorrectFormat.length === 0) {
      initialValueInCorrectFormat.push(generateNewValue())
    }

    return initialValueInCorrectFormat
  })

  const error = get(formik?.errors, name, '')
  const touched = get(formik?.touched, name)
  const hasSubmitted = get(formik, 'submitCount', 0) > 0

  const addValue: () => void = () => {
    setValue(currentValue => currentValue.concat(generateNewValue()))
  }

  const removeValue: (id: string) => () => void = id => () => {
    setValue(currentValue => currentValue.filter(item => item.id !== id))
  }

  const changeValue: (id: string, newValue: string) => void = (id, newValue) => {
    formik?.setFieldTouched(name, true)
    setValue(currentValue =>
      currentValue.map(item => {
        if (item.id === id) {
          return {
            id,
            value: newValue
          }
        }
        return item
      })
    )
  }

  React.useEffect(() => {
    const initialValue = get(formik?.values, name, '') as ListType
    const valueWithoutEmptyItems = value.filter(item => !!item.value)

    if (isEmpty(valueWithoutEmptyItems) && initialValue) {
      const initialValueInCorrectFormat = initialValue.map((item: string | { [key: string]: string }) => ({
        id: uuid('', nameSpace()),
        value: withObjectStructure && keyName ? (item as { [key: string]: string })[keyName] : item
      })) as ListUIType

      // Adding a default value
      if (Array.isArray(initialValueInCorrectFormat) && !initialValueInCorrectFormat.length) {
        initialValueInCorrectFormat.push(generateNewValue())
      }

      setValue(initialValueInCorrectFormat)
    }
  }, [formik?.values, name])

  React.useEffect(() => {
    let valueInCorrectFormat: ListType = []
    if (Array.isArray(value)) {
      valueInCorrectFormat = value
        .filter(item => !!item.value)
        .map(item => {
          return withObjectStructure && keyName ? { [keyName]: item.value } : item.value
        }) as ListType
    }

    if (isEmpty(valueInCorrectFormat)) {
      formik?.setFieldValue(name, undefined)
    } else {
      formik?.setFieldValue(name, valueInCorrectFormat)
    }
  }, [name, value, formik?.setFieldValue])

  return (
    <div className={cx(css.group, css.withoutSpacing)} {...restProps}>
      <MultiTypeFieldSelector
        name={name}
        defaultValueToReset={[{ id: uuid('', nameSpace()), value: '' }]}
        style={{ flexGrow: 1, marginBottom: 0 }}
        {...multiTypeFieldSelectorProps}
        disableTypeSelection={multiTypeFieldSelectorProps.disableTypeSelection || disabled}
      >
        <Card style={{ width: '100%' }}>
          {value.map(({ id, value: valueValue }, index: number) => {
            // const valueError = get(error, `[${index}].value`)

            return (
              <div className={css.group} key={id}>
                <div style={{ flexGrow: 1 }}>
                  <MultiTextInput
                    name=""
                    textProps={{ name: `${name}[${index}].value` }}
                    value={valueValue}
                    placeholder={placeholder}
                    onChange={v => changeValue(id, v as any)}
                    data-testid={`value-${name}-[${index}]`}
                    intent={(touched || hasSubmitted) && error ? Intent.DANGER : Intent.NONE}
                    disabled={disabled}
                    allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
                    {...multiTextInputProps}
                  />
                </div>
                {!disabled && (
                  <Button
                    icon="main-trash"
                    iconProps={{ size: 20 }}
                    minimal
                    onClick={removeValue(id)}
                    data-testid={`remove-${name}-[${index}]`}
                  />
                )}
              </div>
            )
          })}

          {!disabled && (
            <Button
              intent="primary"
              minimal
              text={getString('plusAdd')}
              data-testid={`add-${name}`}
              onClick={addValue}
            />
          )}
        </Card>
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

export default connect(MultiTypeListInputSet)
