import React from 'react'
import { isEmpty } from 'lodash-es'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { Card, Layout, Text, Color, PageSpinner, Popover } from '@wings-software/uicore'
import cx from 'classnames'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import { useStrings } from 'framework/strings'
import type { ModuleName } from 'framework/types/ModuleName'
import type { Maybe } from 'services/common/services'
import SvgInline from '@common/components/SvgInline/SvgInline'
import { getBtns, getPriceTips, getPrice, TIME_TYPE } from './planUtils'
import type { BtnProps } from './PlanContainer'
import CurrentPlanHeader from './CurrentPlanHeader'
import css from './Plan.module.scss'
interface PlanProps {
  plan?: Maybe<{
    title: Maybe<string>
    desc: Maybe<string>
    price: Maybe<string>
    priceTips: Maybe<string>
    yearlyPrice: Maybe<string>
    yearlyPriceTips: Maybe<string>
    priceTerm: Maybe<string>
    priceTermTips: Maybe<string>
    yearlyPriceTerm: Maybe<string>
    yearlyPriceTermTips: Maybe<string>
    unit: Maybe<string>
    unitTips: Maybe<string>
    link: Maybe<string>
    buttonText: Maybe<string>
    primaryButton: Maybe<boolean>
    img: Maybe<{ __typename?: 'UploadFile'; url: string; width: Maybe<number>; height: Maybe<number> }>
    support: Maybe<string>
    featureListZone: Maybe<
      Array<
        Maybe<{
          __typename?: 'ComponentPageFeatureLIstZone'
          id: string
          title: Maybe<string>
          link: Maybe<string>
        }>
      >
    >
    btnProps?: BtnProps[]
    currentPlanProps?: {
      isCurrentPlan?: boolean
      isTrial?: boolean
      isPaid?: boolean
    }
  }>

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
  const url = `https://cms.harness.io${plan?.img?.url}`
  const hasUnit = !isEmpty(plan?.unit) && plan?.price?.toLowerCase() !== CUSTOM_PRICING

  const { openMarketoContactSales, loading: loadingContactSales } = useContactSalesMktoModal({})
  const { getString } = useStrings()

  const { isCurrentPlan, isTrial, isPaid } = plan?.currentPlanProps || {}
  const { btnProps } = plan || {}
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
      <Popover interactionKind={PopoverInteractionKind.HOVER} content={toolTip}>
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
            <Text font={{ weight: 'semi-bold', size: 'medium' }} className={textColorClassName}>
              {plan?.title}
            </Text>
            <Layout.Vertical padding={{ top: 'large' }} flex={{ align: CENTER_CENTER }} spacing="medium">
              <Layout.Horizontal spacing="small">
                {getPrice({ timeType, plan, openMarketoContactSales, getString })}
                {hasUnit && (
                  <Layout.Vertical padding={{ left: 'small' }} flex={{ justifyContent: 'center', alignItems: 'start' }}>
                    <Text font={{ size: 'small' }} className={textColorClassName} tooltip={plan?.unitTips || ''}>
                      {plan?.unit}
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
              {plan?.desc}
            </Text>
            <ul className={css.ul}>
              {plan?.featureListZone?.map(feature => (
                <li key={feature?.title} className={css.li}>
                  <Text>{feature?.title}</Text>
                </li>
              ))}
            </ul>
            <Text className={css.support}>{plan?.support}</Text>
          </Layout.Vertical>
        </Layout.Vertical>
      </Popover>
    </Card>
  )
}

export default Plan
