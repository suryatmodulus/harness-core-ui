import React, { useMemo } from 'react'
import { Select, SelectOption } from '@wings-software/uicore'
import classNames from 'classnames'
import { useStrings } from 'framework/strings'
import { getDropdownOptions } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown.utils'
import { VerificationType } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown.constants'
import type { HealthSourceDropDownProps } from './HealthSourcesDropdown.types'
import css from './HealthSourcesDropdown.module.scss'

export function HealthSourceDropDown(props: HealthSourceDropDownProps): JSX.Element {
  const { onChange, className, verificationType = VerificationType.TIME_SERIES, data, error, loading } = props
  const { getString } = useStrings()

  const healthSources: SelectOption[] = useMemo(() => {
    return getDropdownOptions({ loading, error, data, verificationType }, getString)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error, loading, verificationType])

  return (
    <Select
      items={healthSources}
      className={classNames(css.maxDropDownWidth, className)}
      defaultSelectedItem={healthSources?.[0]}
      key={healthSources?.[0]?.value as string}
      inputProps={{ placeholder: getString('pipeline.verification.healthSourcePlaceholder') }}
      onChange={item => {
        onChange(item?.value === 'all' ? '' : (item.value as string))
      }}
    />
  )
}
