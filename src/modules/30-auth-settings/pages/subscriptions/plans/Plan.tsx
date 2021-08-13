import React from 'react'
import { Card, Layout, Text, Button, Color } from '@wings-software/uicore'
import cx from 'classnames'
import type { Maybe } from 'services/common/services'
import SvgInline from '@common/components/SvgInline/SvgInline'
import css from './Plan.module.scss'
interface PlanProps {
  plan?: Maybe<{
    title: Maybe<string>
    desc: Maybe<string>
    price: Maybe<string>
    yearlyPrice: Maybe<string>
    unit: Maybe<string>
    link: Maybe<string>
    buttonText: Maybe<string>
    primaryButton: Maybe<boolean>
    img: Maybe<{ __typename?: 'UploadFile'; url: string; width: Maybe<number>; height: Maybe<number> }>
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
  cardColorClassName: string
}

export enum TIME_TYPE {
  YEARLY = 'yearly',
  MONTHLY = 'monthly'
}

const Plan: React.FC<PlanProps> = ({ plan, timeType, textColorClassName, cardColorClassName }) => {
  const url = `https://cms.harness.io${plan?.img?.url}`
  const className = cx(css.icon, textColorClassName)
  return (
    <Card className={cx(css.plan, cardColorClassName)}>
      <Layout.Vertical flex={{ align: 'center-center' }} spacing="large">
        <SvgInline url={url} className={className} />
        <Text font={{ weight: 'semi-bold', size: 'medium' }} className={textColorClassName}>
          {plan?.title}
        </Text>
        <Text font={{ weight: 'bold', size: 'large' }} color={Color.BLACK}>
          {timeType === TIME_TYPE.MONTHLY ? plan?.price : plan?.yearlyPrice}
        </Text>
        <Button intent="none">{plan?.buttonText}</Button>
        <Text color={Color.BLACK} padding="large" className={css.desc}>
          {plan?.desc}
        </Text>
        <ul className={css.ul}>
          {plan?.featureListZone?.map(feature => (
            <li key={feature?.id} className={css.li}>
              <Text className={textColorClassName}>{feature?.title}</Text>
            </li>
          ))}
        </ul>
      </Layout.Vertical>
    </Card>
  )
}

export default Plan
