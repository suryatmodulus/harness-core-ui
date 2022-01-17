import React from 'react'
import { isEmpty } from 'lodash-es'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { Card, Layout, Text, Color, PageSpinner, Popover } from '@wings-software/uicore'
import cx from 'classnames'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import { useStrings } from 'framework/strings'
import type { ModuleName } from 'framework/types/ModuleName'
import SvgInline from '@common/components/SvgInline/SvgInline'
import { getBtns, getPriceTips, getPrice, TIME_TYPE } from './planUtils'
import type { PlanData } from './planUtils'
import CurrentPlanHeader from './CurrentPlanHeader'
import css from './Plan.module.scss'
interface PlanProps {
  plan: PlanData
  timeType: TIME_TYPE
  module: ModuleName
}

const CENTER_CENTER = 'center-center'
const CUSTOM_PRICING = 'custom pricing'

const textColorMap: Record<string, string> = {
  cd: css.cdColor,
  ce: css.ccmColor,
  cf: css.ffColor,
  ci: css.ciColor
}

const borderMap: Record<string, string> = {
  cd: css.cdBorder,
  ce: css.ccmBorder,
  cf: css.ffBorder,
  ci: css.ciBorder
}

const Plan: React.FC<PlanProps> = ({ plan, timeType, module }) => {
  const { planProps, btnProps } = plan
  const url = `https://cms.harness.io${planProps?.img?.url}`
  const hasUnit = !isEmpty(planProps?.unit) && planProps?.price?.toLowerCase() !== CUSTOM_PRICING

  const { openMarketoContactSales, loading: loadingContactSales } = useContactSalesMktoModal({})
  const { getString } = useStrings()

  const { isCurrentPlan, isTrial, isPaid } = plan?.currentPlanProps || {}
  const { planDisabledStr } = btnProps?.find(btnProp => btnProp.planDisabledStr) || {}
  const isPlanDisabled = planDisabledStr !== undefined

  const moduleStr = module.toLowerCase()
  const currentPlanClassName = isCurrentPlan ? css.currentPlan : undefined
  const currentPlanBodyClassName = isCurrentPlan ? css.currentPlanBody : undefined
  const iConClassName = cx(css.icon, textColorMap[moduleStr])
  const textColorClassName = textColorMap[moduleStr]
  const borderClassName = isCurrentPlan ? borderMap[moduleStr] : undefined

  if (loadingContactSales) {
    return <PageSpinner />
  }

  const toolTip = planDisabledStr && (
    <Layout.Vertical padding="medium" className={css.tooltip}>
      <Text color={Color.GREY_800} padding={{ bottom: 'small' }}>
        {planDisabledStr}
      </Text>
    </Layout.Vertical>
  )

  return (
    <Card className={cx(css.plan, currentPlanClassName, borderClassName)} disabled={isPlanDisabled}>
      <Layout.Vertical flex={{ align: CENTER_CENTER }}>
        <CurrentPlanHeader
          isTrial={isTrial}
          isPaid={isPaid}
          timeType={timeType}
          module={module}
          isCurrentPlan={isCurrentPlan}
        />
        <Layout.Vertical
          flex={{ align: CENTER_CENTER }}
          spacing="large"
          padding={{ top: 'xxlarge' }}
          className={currentPlanBodyClassName}
        >
          <SvgInline url={url} className={iConClassName} />
          <Popover interactionKind={PopoverInteractionKind.HOVER} content={toolTip}>
            <Text font={{ weight: 'semi-bold', size: 'medium' }} className={textColorClassName}>
              {planProps?.title}
            </Text>
          </Popover>
          <Layout.Vertical padding={{ top: 'large' }} flex={{ align: CENTER_CENTER }} spacing="medium">
            <Layout.Horizontal spacing="small">
              {getPrice({ timeType, plan, openMarketoContactSales, getString })}
              {hasUnit && (
                <Layout.Vertical padding={{ left: 'small' }} flex={{ justifyContent: 'center', alignItems: 'start' }}>
                  <Text font={{ size: 'small' }} className={textColorClassName} tooltip={planProps?.unitTips || ''}>
                    {planProps?.unit}
                  </Text>
                  <Text font={{ size: 'small' }} color={Color.BLACK}>
                    {getString('common.perMonth')}
                  </Text>
                </Layout.Vertical>
              )}
            </Layout.Horizontal>
            {getPriceTips({ timeType, plan, textColorClassName })}
          </Layout.Vertical>
          {getBtns({ isPlanDisabled, btnProps, getString })}
          <Text color={Color.BLACK} padding="large" className={css.desc}>
            {planProps?.desc}
          </Text>
          <ul className={css.ul}>
            {planProps?.featureListZone?.map(feature => (
              <li key={feature?.title} className={css.li}>
                <Text>{feature?.title}</Text>
              </li>
            ))}
          </ul>
          <Text className={css.support}>{planProps?.support}</Text>
        </Layout.Vertical>
      </Layout.Vertical>
    </Card>
  )
}

export default Plan
