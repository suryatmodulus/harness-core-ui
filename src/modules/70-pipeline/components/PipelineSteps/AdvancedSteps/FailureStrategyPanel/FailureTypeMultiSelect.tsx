import React from 'react'
import { FormGroup, Menu, Intent } from '@blueprintjs/core'
import { MultiSelect as BPMultiSelect, ItemRenderer } from '@blueprintjs/select'
import { connect, FormikContext } from 'formik'
import { get } from 'lodash-es'

import { errorCheck } from '@common/utils/formikHelpers'
import { useStrings, StringKeys } from 'framework/exports'

import { ErrorType, errorTypesOrder } from './StrategySelection/StrategyConfig'
import css from './FailureStrategyPanel.module.scss'

interface Option {
  label: string
  value: ErrorType
}

const stringsMap: Record<ErrorType, StringKeys> = {
  [ErrorType.AnyOther]: 'pipeline.failureStrategies.errorTypeLabels.AnyOther',
  [ErrorType.Authentication]: 'pipeline.failureStrategies.errorTypeLabels.Authentication',
  [ErrorType.Authorization]: 'pipeline.failureStrategies.errorTypeLabels.Authorization',
  [ErrorType.Connectivity]: 'pipeline.failureStrategies.errorTypeLabels.Connectivity',
  [ErrorType.DelegateProvisioning]: 'pipeline.failureStrategies.errorTypeLabels.DelegateProvisioning',
  [ErrorType.Timeout]: 'pipeline.failureStrategies.errorTypeLabels.Timeout',
  [ErrorType.Verification]: 'pipeline.failureStrategies.errorTypeLabels.Verification'
}

const MultiSelect = BPMultiSelect.ofType<Option>()

const itemRenderer: ItemRenderer<Option> = (item, itemProps) => {
  return <Menu.Item key={item.value} onClick={itemProps.handleClick} text={item.label} />
}

const tagRenderer = (item: Option): string => {
  return item?.label
}

export interface FailureTypeMultiSelectProps {
  label: string
  name: string
  filterTypes?: ErrorType[]
}

export interface ConnectedFailureTypeMultiSelectProps extends FailureTypeMultiSelectProps {
  formik: FormikContext<{}>
}

export function FailureTypeMultiSelect(props: ConnectedFailureTypeMultiSelectProps): React.ReactElement {
  const { name, label, formik, filterTypes = [] } = props
  const { getString } = useStrings()

  const hasError = errorCheck(name, formik)
  const intent = hasError ? Intent.DANGER : Intent.NONE
  const helperText = hasError ? get(formik?.errors, name) : null
  const selectedValues = get(formik.values, name) || []
  const selectedValuesSet = new Set<ErrorType>(selectedValues)
  const options: Option[] = (() => {
    const filterTypesSet = new Set(filterTypes)

    selectedValuesSet.forEach(val => filterTypesSet.delete(val))

    return errorTypesOrder.filter(e => !filterTypesSet.has(e)).map(e => ({ value: e, label: stringsMap[e] }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })()

  function handleItemSelect(item: Option): void {
    if (item.value === ErrorType.AnyOther) {
      formik.setFieldValue(name, [item.value])
      formik.setFieldTouched(name, true)
      return
    }
    formik.setFieldValue(name, [...selectedValues, item.value])
    formik.setFieldTouched(name, true)
  }

  function itemListPredicate(query: string, listItems: Option[]): Option[] {
    if (selectedValuesSet.has(ErrorType.AnyOther)) {
      return []
    }

    return listItems.filter(item => {
      if (selectedValuesSet.has(item.value as ErrorType)) {
        return false
      }

      if (query) {
        return item.value.trim().toLowerCase().startsWith(query.trim().toLowerCase())
      }

      return true
    })
  }

  const selectedOptions: Option[] = selectedValues.map((key: ErrorType) => ({
    value: key,
    label: getString(stringsMap[key])
  }))

  function onRemove(value: string): void {
    const newItems = selectedOptions.filter(item => item.label !== value).map(item => item.value)
    formik.setFieldValue(name, newItems)
    formik.setFieldTouched(name, true)
  }

  return (
    <FormGroup label={label} labelFor={name} helperText={helperText} intent={intent}>
      <MultiSelect
        className={css.errorSelect}
        selectedItems={selectedOptions}
        itemListPredicate={itemListPredicate}
        onItemSelect={handleItemSelect}
        items={options}
        fill
        popoverProps={{ minimal: true }}
        itemRenderer={itemRenderer}
        tagRenderer={tagRenderer}
        tagInputProps={{ onRemove, tagProps: { className: css.tag }, inputProps: { name } }}
        itemsEqual="value"
      />
    </FormGroup>
  )
}

export default connect<FailureTypeMultiSelectProps>(FailureTypeMultiSelect)
