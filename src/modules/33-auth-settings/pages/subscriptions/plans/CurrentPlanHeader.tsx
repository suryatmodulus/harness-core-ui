import React, { ReactElement } from 'react'
import { capitalize } from 'lodash-es'
import { Text, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { ModuleName } from 'framework/types/ModuleName'
import type { TIME_TYPE } from './planUtils'
import css from './Plan.module.scss'

interface CurrentPlanHeaderProps {
  isTrial?: boolean
  isPaid?: boolean
  timeType: TIME_TYPE
  module: ModuleName
  isCurrentPlan?: boolean
}

const fillMap: Record<string, string> = {
  cd: css.cdFill,
  ce: css.ccmFill,
  cf: css.ffFill,
  ci: css.ciFill
}

const bgColorMap: Record<string, string> = {
  cd: css.cdBgColor,
  ce: css.ccmBgColor,
  cf: css.ffBgColor,
  ci: css.ciBgColor
}

const CurrentPlanHeader = ({
  isTrial,
  isPaid,
  timeType,
  module,
  isCurrentPlan
}: CurrentPlanHeaderProps): ReactElement => {
  const moduleStr = module.toLowerCase()
  const fillClassName = fillMap[moduleStr]
  const bgColorClassName = bgColorMap[moduleStr]
  const { getString } = useStrings()
  function getPlanHeaderStr(): string {
    const currentPlanStr = getString('common.plans.currentPlan')
    if (isTrial) {
      return currentPlanStr.concat(' (').concat(getString('common.plans.freeTrial')).concat(')')
    }

    if (isPaid) {
      return currentPlanStr
        .concat(' (')
        .concat(capitalize(timeType))
        .concat(' ')
        .concat(getString('common.plans.subscription'))
        .concat(')')
    }

    return currentPlanStr
  }

  return isCurrentPlan ? (
    <span className={cx(css.currentPlanHeader, bgColorClassName)}>
      <Text
        icon="deployment-success-legacy"
        iconProps={{ className: fillClassName }}
        color={Color.WHITE}
        flex={{ justifyContent: 'center' }}
      >
        {getPlanHeaderStr()}
      </Text>
    </span>
  ) : (
    <></>
  )
}

export default CurrentPlanHeader
