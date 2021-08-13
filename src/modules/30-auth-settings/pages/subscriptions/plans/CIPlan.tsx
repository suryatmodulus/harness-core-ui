import React from 'react'
import { Layout } from '@wings-software/uicore'
import type { FetchPlansQuery } from 'services/common/services'
import type { TIME_TYPE } from './Plan'
import Plan from './Plan'
import css from './CIPlans.module.scss'

interface CIPlanProps {
  ciSaasPlans?: NonNullable<FetchPlansQuery['pricing']>['ciSaasPlans']
  timeType: TIME_TYPE
}

const CIPlan: React.FC<CIPlanProps> = ({ ciSaasPlans, timeType }) => {
  return (
    <Layout.Horizontal spacing="large">
      {ciSaasPlans?.map(plan => (
        <Plan
          key={plan?.title}
          plan={plan}
          timeType={timeType}
          textColorClassName={css.primary6}
          cardColorClassName={css.ciBackground}
        />
      ))}
    </Layout.Horizontal>
  )
}

export default CIPlan
