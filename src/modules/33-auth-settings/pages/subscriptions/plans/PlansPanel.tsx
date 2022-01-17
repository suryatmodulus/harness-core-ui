/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, Text, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { FetchPlansQuery } from 'services/common/services'
import type { ModuleName } from 'framework/types/ModuleName'
import { TIME_TYPE } from './planUtils'
import PlanContainer from './PlanContainer'
import css from './Plans.module.scss'

interface PlansPanelProps {
  module: ModuleName
  plans?: NonNullable<FetchPlansQuery['pricing']>['ciSaasPlans' | 'ffPlans' | 'cdPlans' | 'ccPlans']
}

const PlansPanel: React.FC<PlansPanelProps> = ({ plans, module }) => {
  const { getString } = useStrings()
  const [timeType, setTimeType] = useState<TIME_TYPE>(TIME_TYPE.YEARLY)
  const yearlySelected = timeType === TIME_TYPE.YEARLY ? css.selected : ''
  const monthlySelected = timeType === TIME_TYPE.MONTHLY ? css.selected : ''
  if (plans) {
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
          <PlanContainer plans={plans} timeType={TIME_TYPE.YEARLY} moduleName={module} />
        ) : (
          <PlanContainer plans={plans} timeType={TIME_TYPE.MONTHLY} moduleName={module} />
        )}
      </Layout.Vertical>
    )
  }
  return <></>
}

export default PlansPanel
