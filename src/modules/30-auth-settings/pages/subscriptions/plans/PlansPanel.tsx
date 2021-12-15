import React, { useState } from 'react'
import { Layout, Text, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { FetchPlansQuery } from 'services/common/services'
import type { ModuleName } from 'framework/types/ModuleName'
import { PLAN_UNIT } from '@common/constants/SubscriptionTypes'
import PlanContainer from './PlanContainer'
import css from './Plans.module.scss'

interface PlansPanelProps {
  module: ModuleName
  plans?: NonNullable<FetchPlansQuery['pricing']>['ciSaasPlans' | 'ffPlans' | 'cdPlans' | 'ccPlans']
}

const PlansPanel: React.FC<PlansPanelProps> = ({ plans, module }) => {
  const { getString } = useStrings()
  const [timeType, setTimeType] = useState<PLAN_UNIT>(PLAN_UNIT.YEARLY)
  const yearlySelected = timeType === PLAN_UNIT.YEARLY ? css.selected : ''
  const monthlySelected = timeType === PLAN_UNIT.MONTHLY ? css.selected : ''
  if (plans) {
    return (
      <Layout.Vertical>
        <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
          <Text padding={{ right: 'medium', top: 'small' }}>{getString('common.billed')}</Text>
          <Text
            color={Color.PRIMARY_6}
            padding={{ left: 'medium', right: 'medium', top: 'small', bottom: 'small' }}
            className={cx(css.yearly, yearlySelected)}
            onClick={() => setTimeType(PLAN_UNIT.YEARLY)}
          >
            {getString('common.yearly')}
          </Text>
          <Text
            color={Color.PRIMARY_6}
            padding={{ left: 'medium', right: 'medium', top: 'small', bottom: 'small' }}
            className={cx(css.monthly, monthlySelected)}
            onClick={() => setTimeType(PLAN_UNIT.MONTHLY)}
          >
            {getString('common.monthly')}
          </Text>
        </Layout.Horizontal>
        {timeType === PLAN_UNIT.YEARLY ? (
          <PlanContainer plans={plans} timeType={PLAN_UNIT.YEARLY} moduleName={module} />
        ) : (
          <PlanContainer plans={plans} timeType={PLAN_UNIT.MONTHLY} moduleName={module} />
        )}
      </Layout.Vertical>
    )
  }
  return <></>
}

export default PlansPanel
