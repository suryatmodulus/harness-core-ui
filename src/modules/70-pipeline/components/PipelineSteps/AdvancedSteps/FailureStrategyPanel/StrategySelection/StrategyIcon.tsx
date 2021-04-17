import React from 'react'
import { Icon } from '@wings-software/uicore'
import type { IconName } from '@wings-software/uicore'

import { String } from 'framework/exports'

import { Strategy } from './StrategyConfig'
import css from './StrategySelection.module.scss'

export const strategyIconMap: Record<Strategy, IconName> = {
  [Strategy.Ignore]: 'delete',
  [Strategy.Abort]: 'ban-circle',
  [Strategy.MarkAsSuccess]: 'tick',
  [Strategy.StageRollback]: 'repeat',
  [Strategy.StepGroupRollback]: 'repeat',
  [Strategy.Retry]: 'refresh',
  [Strategy.ManualIntervention]: 'hand-up'
}

export interface StrategyIconProps {
  strategy: Strategy
  onChange?(e: React.ChangeEvent<HTMLInputElement>): void
  checked?: boolean
}

const getStringID = (strategy: Strategy): string => {
  switch (strategy) {
    case Strategy.Retry:
      return 'retry'
    case Strategy.Abort:
      return 'abort'
    default:
      return `failureStrategies.strategiesLabel.${strategy}`
  }
}

export function StrategyIcon({ strategy, onChange, checked }: StrategyIconProps): React.ReactElement {
  return (
    <label className={css.strategyIcon}>
      <div className={css.icon}>
        {checked ? <div className={css.checkMark} /> : null}
        <Icon name={strategyIconMap[strategy]} size={22} />
      </div>
      <String stringID={getStringID(strategy)} />
      <input
        type="checkbox"
        data-testid={`failure-strategy-${strategy.toLowerCase()}`}
        // name={name}
        value={strategy}
        onChange={onChange}
        checked={checked}
      />
    </label>
  )
}
