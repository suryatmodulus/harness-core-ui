import React, { CSSProperties, ReactChild } from 'react'
import {
  MultiTypeInputType,
  Button,
  Icon,
  MultiTypeIcon as TypeIcon,
  MultiTypeIconSize as TypeIconSize,
  getMultiTypeFromValue,
  RUNTIME_INPUT_VALUE,
  MultiTypeInputMenu,
  FormError,
  FormikTooltipContext,
  DataTooltipInterface,
  HarnessDocTooltip,
  FormInput
} from '@wings-software/uicore'
import { Popover, IFormGroupProps, Intent, FormGroup } from '@blueprintjs/core'
import cx from 'classnames'
import { FormikContext, connect } from 'formik'
import { get } from 'lodash-es'
import { errorCheck } from '@common/utils/formikHelpers'

import css from './MultiTypeFieldSelctor.module.scss'

export interface MultiTypeFieldSelectorProps extends Omit<IFormGroupProps, 'label' | 'placeholder'> {
  children: Exclude<React.ReactNode, null | undefined>
  name: string
  label: string | ReactChild
  defaultValueToReset?: unknown
  style?: CSSProperties
  disableTypeSelection?: boolean
  skipRenderValueInExpressionLabel?: boolean
  expressionRender?(): React.ReactNode
  allowedTypes?: MultiTypeInputType[]
  isOptional?: boolean
  optionalLabel?: string
  tooltipProps?: DataTooltipInterface
}

export interface ConnectedMultiTypeFieldSelectorProps extends MultiTypeFieldSelectorProps {
  formik: FormikContext<any>
}

export interface TypeSelectorProps {
  type: MultiTypeInputType
  onChange: (type: MultiTypeInputType) => void
  allowedTypes: MultiTypeInputType[]
}

function TypeSelector(props: TypeSelectorProps): React.ReactElement {
  const { type, onChange, allowedTypes } = props

  return (
    <Popover
      position="bottom-right"
      interactionKind="click"
      minimal
      wrapperTagName="div"
      targetTagName="div"
      className={css.typeSelectorWrapper}
      targetClassName={css.typeSelector}
      popoverClassName={css.popover}
    >
      <Button minimal className={css.btn} withoutBoxShadow withoutCurrentColor>
        <Icon
          className={cx(css.icon, (css as any)[type.toLowerCase()])}
          size={TypeIconSize[type]}
          name={TypeIcon[type]}
        />
      </Button>
      <MultiTypeInputMenu allowedTypes={allowedTypes} onTypeSelect={onChange} />
    </Popover>
  )
}

export function MultiTypeFieldSelector(props: ConnectedMultiTypeFieldSelectorProps): React.ReactElement | null {
  const {
    formik,
    label,
    name,
    children,
    defaultValueToReset,
    disableTypeSelection,
    allowedTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
    expressionRender,
    skipRenderValueInExpressionLabel,
    isOptional,
    optionalLabel = '(optional)',
    ...restProps
  } = props
  const error = get(formik?.errors, name)
  const hasError = errorCheck(name, formik) && typeof error === 'string'
  const labelText = !isOptional ? label : `${label} ${optionalLabel}`
  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError errorMessage={get(formik?.errors, name)} /> : null,
    disabled,
    ...rest
  } = restProps

  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    props.tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')

  const value: string = get(formik?.values, name, '')

  const [type, setType] = React.useState(getMultiTypeFromValue(value))

  function handleChange(newType: MultiTypeInputType): void {
    setType(newType)
    if (newType === type) return
    formik.setFieldValue(name, newType === MultiTypeInputType.RUNTIME ? RUNTIME_INPUT_VALUE : defaultValueToReset)
  }

  if (type === MultiTypeInputType.RUNTIME && getMultiTypeFromValue(value) !== MultiTypeInputType.RUNTIME) return null

  return (
    <FormGroup
      {...rest}
      className={type === MultiTypeInputType.RUNTIME ? css.formGroup : ''}
      labelFor={name}
      helperText={helperText}
      intent={intent}
      disabled={disabled}
      label={
        <div className={css.formLabel}>
          <HarnessDocTooltip tooltipId={dataTooltipId} labelText={labelText} />
          {disableTypeSelection ? null : (
            <TypeSelector allowedTypes={allowedTypes} type={type} onChange={handleChange} />
          )}
        </div>
      }
    >
      {disableTypeSelection || type === MultiTypeInputType.FIXED ? (
        children
      ) : type === MultiTypeInputType.EXPRESSION && typeof expressionRender === 'function' ? (
        expressionRender()
      ) : type === MultiTypeInputType.RUNTIME && typeof value === 'string' ? (
        <FormInput.Text className={css.runtimeDisabled} name={name} disabled label="" />
      ) : null}
    </FormGroup>
  )
}

export default connect<MultiTypeFieldSelectorProps>(MultiTypeFieldSelector)
