import React, { ReactElement } from 'react'
import { isEmpty, capitalize } from 'lodash-es'
import { Card, Layout, Text, Button, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import { useStrings } from 'framework/strings'
import type { ModuleName } from 'framework/types/ModuleName'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { Maybe } from 'services/common/services'
import SvgInline from '@common/components/SvgInline/SvgInline'
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
    btnProps?: {
      buttonText: string
      btnLoading: boolean
      onClick?: () => void
    }
    currentPlanProps?: {
      isCurrentPlan?: boolean
      isTrial?: boolean
      isPaid?: boolean
    }
  }>

  timeType: TIME_TYPE
  module: ModuleName
}

export enum TIME_TYPE {
  YEARLY = 'yearly',
  MONTHLY = 'monthly'
}

const CENTER_CENTER = 'center-center'
const CUSTOM_PRICING = 'custom pricing'

const textColorMap: Record<string, string> = {
  cd: css.cdColor,
  ce: css.ccmColor,
  cf: css.ffColor,
  ci: css.ciColor
}

const bgColorMap: Record<string, string> = {
  cd: css.cdBgColor,
  ce: css.ccmBgColor,
  cf: css.ffBgColor,
  ci: css.ciBgColor
}

const borderMap: Record<string, string> = {
  cd: css.cdBorder,
  ce: css.ccmBorder,
  cf: css.ffBorder,
  ci: css.ciBorder
}

const fillMap: Record<string, string> = {
  cd: css.cdFill,
  ce: css.ccmFill,
  cf: css.ffFill,
  ci: css.ciFill
}

const Plan: React.FC<PlanProps> = ({ plan, timeType, module }) => {
  const url = `https://cms.harness.io${plan?.img?.url}`
  const hasUnit = !isEmpty(plan?.unit) && plan?.price?.toLowerCase() !== CUSTOM_PRICING

  const { openMarketoContactSales, loading: loadingContactSales } = useContactSalesMktoModal({})
  const { getString } = useStrings()

  function getPrice(): React.ReactElement {
    const price = timeType === TIME_TYPE.MONTHLY ? plan?.price : plan?.yearlyPrice
    if (price?.toLowerCase() === CUSTOM_PRICING) {
      return (
        <Layout.Horizontal spacing="xsmall" flex={{ align: CENTER_CENTER }} className={css.lineHeight2}>
          <Text
            onClick={openMarketoContactSales}
            color={Color.PRIMARY_6}
            font={{ size: 'medium' }}
            className={css.hover}
          >
            {getString('common.banners.trial.contactSales')}
          </Text>
          <Text color={Color.BLACK} font={{ size: 'medium' }}>
            {getString('common.customPricing')}
          </Text>
        </Layout.Horizontal>
      )
    }
    return (
      <Text font={{ weight: 'semi-bold', size: 'large' }} color={Color.BLACK}>
        {price}
      </Text>
    )
  }

  function getPriceTips(): React.ReactElement {
    const priceTips = timeType === TIME_TYPE.MONTHLY ? plan?.priceTips : plan?.yearlyPriceTips
    const priceTerm = timeType === TIME_TYPE.MONTHLY ? plan?.priceTerm : plan?.yearlyPriceTerm
    const priceTermTips = timeType === TIME_TYPE.MONTHLY ? plan?.priceTermTips : plan?.yearlyPriceTermTips

    if (!isEmpty(priceTerm) && !isEmpty(priceTermTips)) {
      const tips = priceTips?.split(priceTerm || '')
      return (
        <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'baseline' }}>
          <Text
            color={Color.BLACK}
            font={{ weight: 'light', size: 'small' }}
            padding={{ left: 'large' }}
            className={css.centerText}
          >
            {tips?.[0]}
          </Text>
          <Text
            font={{ weight: 'light', size: 'small' }}
            className={cx(css.centerText, textColorClassName)}
            tooltip={priceTermTips || ''}
          >
            {priceTerm}
          </Text>
          <Text
            color={Color.BLACK}
            font={{ weight: 'light', size: 'small' }}
            padding={{ right: 'large' }}
            className={css.centerText}
          >
            {tips?.[1]}
          </Text>
        </Layout.Horizontal>
      )
    }

    return (
      <Text
        color={Color.BLACK}
        font={{ weight: 'light', size: 'small' }}
        padding={{ left: 'large', right: 'large' }}
        className={css.centerText}
      >
        {priceTips}
      </Text>
    )
  }

  if (loadingContactSales) {
    return <PageSpinner />
  }

  const { btnLoading, buttonText, onClick } = plan?.btnProps || {}
  const { isCurrentPlan, isTrial, isPaid } = plan?.currentPlanProps || {}

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

  const CurrentPlanHeader = (): ReactElement => {
    return (
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
    )
  }

  const moduleStr = module.toLowerCase()
  const currentPlanClassName = isCurrentPlan ? css.currentPlan : undefined
  const currentPlanBodyClassName = isCurrentPlan ? css.currentPlanBody : undefined
  const iConClassName = cx(css.icon, textColorMap[moduleStr])
  const textColorClassName = textColorMap[moduleStr]
  const bgColorClassName = bgColorMap[moduleStr]
  const fillClassName = fillMap[moduleStr]
  const borderClassName = isCurrentPlan ? borderMap[moduleStr] : undefined

  return (
    <Card className={cx(css.plan, currentPlanClassName, borderClassName)}>
      <Layout.Vertical flex={{ align: CENTER_CENTER }}>
        {isCurrentPlan && <CurrentPlanHeader />}
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
              {getPrice()}
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
            {getPriceTips()}
          </Layout.Vertical>
          <Button intent="primary" onClick={onClick} loading={btnLoading}>
            {buttonText}
          </Button>
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
    </Card>
  )
}

export default Plan
