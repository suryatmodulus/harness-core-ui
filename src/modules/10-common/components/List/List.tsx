import React from 'react'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { Text, TextInput, Card, Button, Intent, FormInput, MultiTypeInputType } from '@wings-software/uicore'
import { get, isEmpty } from 'lodash-es'
import { connect, FormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import css from './List.module.scss'

export type ListType = string[]
export type ListUIType = { id: string; value: string }[]

export interface ListProps {
  name: string
  label?: string | React.ReactElement
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
  formik?: FormikContext<any>
  expressions?: string[]
  enableExpressions?: boolean
  isNameOfArrayType?: boolean
  labelClassName?: string
}

const generateNewValue: () => { id: string; value: string } = () => ({
  id: uuid('', nameSpace()),
  value: ''
})

export const List = (props: ListProps): React.ReactElement => {
  const {
    name,
    label,
    placeholder,
    disabled,
    style,
    formik,
    expressions,
    isNameOfArrayType,
    labelClassName = ''
  } = props
  const { getString } = useStrings()
  const [value, setValue] = React.useState<ListUIType>(() => {
    const initialValueInCorrectFormat = [
      {
        id: uuid('', nameSpace()),
        value: ''
      }
    ]

    // Adding a default value
    if (Array.isArray(initialValueInCorrectFormat) && !initialValueInCorrectFormat.length) {
      initialValueInCorrectFormat.push(generateNewValue())
    }

    return initialValueInCorrectFormat
  })

  const error = get(formik?.errors, name, '')
  const touched = get(formik?.touched, name)
  const hasSubmitted = get(formik, 'submitCount', 0) > 0

  const addValue: () => void = () => {
    setValue(currentValue => {
      if (expressions?.length) {
        const updatedValue = currentValue.map((listItem: { id: string; value: string }, listItemIndex: number) => {
          const currentItemFormikValue = get(formik?.values, `${name}[${listItemIndex}]`, '')
          return {
            ...listItem,
            value: currentItemFormikValue
          }
        })

        return [...updatedValue, generateNewValue()]
      }
      return currentValue.concat(generateNewValue())
    })
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
      const initialValueInCorrectFormat = (Array.isArray(initialValue) ? initialValue : []).map(item => ({
        id: uuid('', nameSpace()),
        value: item
      }))

      // Adding a default value
      if (Array.isArray(initialValueInCorrectFormat) && !initialValueInCorrectFormat.length) {
        initialValueInCorrectFormat.push(generateNewValue())
      }

      setValue(initialValueInCorrectFormat)
    }
  }, [formik?.values, name, value])

  React.useEffect(() => {
    let valueInCorrectFormat: ListType = []
    if (Array.isArray(value)) {
      valueInCorrectFormat = value.filter(item => !!item.value).map(item => item.value)
    }

    if (isEmpty(valueInCorrectFormat)) {
      formik?.setFieldValue(name, undefined)
    } else {
      formik?.setFieldValue(name, valueInCorrectFormat)
    }
  }, [name, value, formik?.setFieldValue])

  return (
    <div style={style}>
      <div className={labelClassName}>{label}</div>
      <Card style={{ width: '100%' }}>
        {value.map(({ id, value: valueValue }, index: number) => {
          const valueError = get(error, `[${index}].value`)
          return (
            <div className={css.group} key={id}>
              <div style={{ flexGrow: 1 }}>
                {!expressions && (
                  <TextInput
                    value={valueValue}
                    placeholder={placeholder}
                    onChange={e => changeValue(id, (e.currentTarget as HTMLInputElement).value.trim())}
                    data-testid={`value-${name}-[${index}]`}
                    intent={(touched || hasSubmitted) && error ? Intent.DANGER : Intent.NONE}
                    disabled={disabled}
                    errorText={(touched || hasSubmitted) && valueError ? valueError : undefined}
                  />
                )}
                {expressions && (
                  <FormInput.MultiTextInput
                    label={''}
                    placeholder={placeholder}
                    name={isNameOfArrayType ? `${name}[${index}]` : `${name}-${index}`}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                    }}
                  />
                )}
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
          <Button intent="primary" minimal text={getString('plusAdd')} data-testid={`add-${name}`} onClick={addValue} />
        )}
      </Card>

      {(touched || hasSubmitted) && error && typeof error === 'string' ? (
        <Text intent={Intent.DANGER} margin={{ top: 'xsmall' }}>
          {error}
        </Text>
      ) : null}
    </div>
  )
}

export default connect(List)
