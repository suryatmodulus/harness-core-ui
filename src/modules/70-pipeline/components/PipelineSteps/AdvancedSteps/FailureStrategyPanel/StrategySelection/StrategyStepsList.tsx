import React from 'react'
import type { FormikContext } from 'formik'
import { ThumbnailSelect, ThumbnailSelectProps } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import { Strategy, stringsMap, strategyIconMap } from '@pipeline/utils/FailureStrategyUtils'

import css from './StrategySelection.module.scss'

export interface StrategyStepsListProps {
  allowedStrategies: Strategy[]
  name: string
  formik: FormikContext<Record<string, never>>
  disabled?: boolean
  onChange?(): void
}

export function StrategyStepsList(props: StrategyStepsListProps): React.ReactElement {
  const { name, allowedStrategies, onChange, disabled } = props
  const { getString } = useStrings()

  const items: ThumbnailSelectProps['items'] = React.useMemo(() => {
    return allowedStrategies.map(strategy => ({
      label: getString(stringsMap[strategy]),
      icon: strategyIconMap[strategy],
      value: strategy
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedStrategies])

  return (
    <ThumbnailSelect
      name={name}
      items={items}
      thumbnailClassName={css.thumbnail}
      isReadonly={disabled}
      onChange={onChange}
    />
  )
}
