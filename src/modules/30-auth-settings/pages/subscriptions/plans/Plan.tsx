import React from 'react'
import { isEmpty } from 'lodash-es'
import { Card, Layout, Text, Button, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import { useStrings } from 'framework/strings'
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
    onClick?: () => Promise<void>
    btnLoading?: boolean
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
  }>

  timeType: TIME_TYPE
  textColorClassName: string
}

export enum TIME_TYPE {
  YEARLY = 'yearly',
  MONTHLY = 'monthly'
}

const CENTER_CENTER = 'center-center'
const CUSTOM_PRICING = 'custom pricing'

const Plan: React.FC<PlanProps> = ({ plan, timeType, textColorClassName }) => {
  const url = `https://cms.harness.io${plan?.img?.url}`
  const hasUnit = !isEmpty(plan?.unit) && plan?.price?.toLowerCase() !== CUSTOM_PRICING
  const className = cx(css.icon, textColorClassName)
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

  return (
    <Card className={cx(css.plan)}>
      <Layout.Vertical flex={{ align: CENTER_CENTER }} spacing="large">
        <SvgInline url={url} className={className} />
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
        <Button intent="primary" onClick={plan?.onClick} loading={plan?.btnLoading}>
          {plan?.buttonText}
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
    </Card>
  )
}

export default Plan
