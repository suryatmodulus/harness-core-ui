import React from 'react'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import cx from 'classnames'
import {
  Text,
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
import css from './MultiTypeMap.module.scss'

export type MapValue = { id: string; key: string; value: string }[]
export type MultiTypeMapValue = MapValue | string

interface MultiTypeMapConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'> {
  variableName?: ConfigureOptionsProps['variableName']
}

export interface MultiTypeMapProps {
  name: string
  multiTypeFieldSelectorProps: Omit<MultiTypeFieldSelectorProps, 'name' | 'defaultValueToReset' | 'children'>
  valueMultiTextInputProps?: Omit<MultiTextInputProps, 'name'>
  enableConfigureOptions?: boolean
  configureOptionsProps?: MultiTypeMapConfigureOptionsProps
  formik?: FormikContext<any>
  style?: React.CSSProperties
  cardStyle?: React.CSSProperties
  disabled?: boolean
  appearance?: 'default' | 'minimal'
}

export const MultiTypeMap = (props: MultiTypeMapProps): React.ReactElement => {
  const {
    name,
    multiTypeFieldSelectorProps,
    valueMultiTextInputProps = {},
    enableConfigureOptions = true,
    configureOptionsProps,
    cardStyle,
    formik,
    disabled,
    appearance = 'default',
    ...restProps
  } = props
  const value = get(formik?.values, name, '') as MultiTypeMapValue

  const { getString } = useStrings()

  return (
    <div className={cx(css.group, css.withoutSpacing, appearance === 'minimal' ? css.minimalCard : '')} {...restProps}>
      <MultiTypeFieldSelector
        name={name}
        defaultValueToReset={[{ id: uuid('', nameSpace()), key: '', value: '' }]}
        style={{ flexGrow: 1, marginBottom: 0 }}
        {...multiTypeFieldSelectorProps}
        disableTypeSelection={multiTypeFieldSelectorProps.disableTypeSelection || disabled}
      >
        <FieldArray
          name={name}
          render={({ push, remove }) => (
            <Card style={{ width: '100%', ...cardStyle }}>
              {Array.isArray(value) &&
                value.map(({ id }, index: number) => (
                  <div className={cx(css.group, css.withoutAligning)} key={id}>
                    <div style={{ flexGrow: 1 }}>
                      {index === 0 && (
                        <Text
                          margin={{ bottom: 'xsmall' }}
                          font={{ size: appearance === 'minimal' ? 'small' : undefined }}
                        >
                          {getString('keyLabel')}
                        </Text>
                      )}
                      <FormInput.Text name={`${name}[${index}].key`} style={{ margin: 0 }} disabled={disabled} />
                    </div>

                    <div style={{ flexGrow: 1 }}>
                      {index === 0 && (
                        <Text
                          font={{ size: appearance === 'minimal' ? 'small' : undefined }}
                          margin={{ bottom: 'xsmall' }}
                        >
                          {getString('valueLabel')}
                        </Text>
                      )}
                      <div className={cx(css.group, css.withoutAligning, css.withoutSpacing)}>
                        <FormInput.MultiTextInput
                          label=""
                          name={`${name}[${index}].value`}
                          multiTextInputProps={{
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                            ...valueMultiTextInputProps
                          }}
                          style={{ flexGrow: 1 }}
                          disabled={disabled}
                        />
                        <Button
                          icon="main-trash"
                          iconProps={{ size: 20 }}
                          minimal
                          data-testid={`remove-${name}-[${index}]`}
                          onClick={() => remove(index)}
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  </div>
                ))}

              <Button
                intent="primary"
                minimal
                text={getString('plusAdd')}
                data-testid={`add-${name}`}
                onClick={() => push({ id: uuid('', nameSpace()), key: '', value: '' })}
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
            type={getString('map')}
            variableName={name}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={val => formik?.setFieldValue(name, val)}
            {...configureOptionsProps}
          />
        )}
    </div>
  )
}

export default connect(MultiTypeMap)
