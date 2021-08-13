import React, { useState } from 'react'
import { Layout, Text, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { FetchPlansQuery } from 'services/common/services'
import { TIME_TYPE } from './Plan'
import CIPlan from './CIPlan'
import css from './CIPlans.module.scss'

interface CIPlansPanelProps {
  ciSaasPlans?: NonNullable<FetchPlansQuery['pricing']>['ciSaasPlans']
}

const CIPlansPanel: React.FC<CIPlansPanelProps> = ({ ciSaasPlans }) => {
  const { getString } = useStrings()
  const [timeType, setTimeType] = useState<TIME_TYPE>(TIME_TYPE.YEARLY)
  const yearlySelected = timeType === TIME_TYPE.YEARLY ? css.selected : ''
  const monthlySelected = timeType === TIME_TYPE.MONTHLY ? css.selected : ''
  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
        <Text padding={{ right: 'medium', top: 'small' }}>{getString('common.billed')}</Text>
        <Text
          color={Color.PRIMARY_6}
          padding={{ left: 'medium', right: 'medium', top: 'small', bottom: 'small' }}
          className={cx(css.yearly, yearlySelected)}
          onClick={() => setTimeType(TIME_TYPE.YEARLY)}
        >
          {getString('common.yearly')}
        </Text>
        <Text
          color={Color.PRIMARY_6}
          padding={{ left: 'medium', right: 'medium', top: 'small', bottom: 'small' }}
          className={cx(css.monthly, monthlySelected)}
          onClick={() => setTimeType(TIME_TYPE.MONTHLY)}
        >
          {getString('common.monthly')}
        </Text>
      </Layout.Horizontal>
      {timeType === TIME_TYPE.YEARLY ? (
        <CIPlan ciSaasPlans={ciSaasPlans} timeType={TIME_TYPE.YEARLY} />
      ) : (
        <CIPlan ciSaasPlans={ciSaasPlans} timeType={TIME_TYPE.MONTHLY} />
      )}
    </Layout.Vertical>
  )
}

export default CIPlansPanel
