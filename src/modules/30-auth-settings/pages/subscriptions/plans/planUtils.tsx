import React, { ReactElement } from 'react'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { Layout, Text, Button, ButtonVariation, Color } from '@wings-software/uicore'
import type { Editions } from '@common/constants/SubscriptionTypes'
import { PLAN_UNIT } from '@common/constants/SubscriptionTypes'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { EditionActionDTO, SubscriptionDetailDTO, CustomerDetailDTO } from 'services/cd-ng'
import type { ModuleName } from 'framework/types/ModuleName'
import type { StringsMap } from 'stringTypes'
import type { PlansFragment, Maybe } from 'services/common/services'
import { useSubscribeCalculatorModal } from '../payments/SubscriptionCalculatorModal/useSubscribeCalculatorModal'
import { useSubscribePayModal } from '../payments/SubscriptionPayModal/useSubscribePayModal'
import css from './Plan.module.scss'

export type PlanProp = Maybe<{ __typename?: 'ComponentPricingPagePlansZone' } & PlansFragment>

export interface PlanData {
  planProps: PlanProp
}

export interface BtnProps {
  buttonText?: string
  btnLoading: boolean
  onClick?: () => void
  order: number
  isContactSales?: boolean
  isContactSupport?: boolean
  planDisabledStr?: string
}

export interface PlanCalculatedProps {
  btnProps: BtnProps[]
  currentPlanProps: {
    isCurrentPlan?: boolean
    isTrial?: boolean
    isPaid?: boolean
  }
}

interface GetBtnPropsProps {
  plan: PlanProp
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
  handleStartPlan: (planEdition: Editions) => Promise<void>
  handleContactSales: () => void
  handleExtendTrial: (edition: Editions) => Promise<void>
  handleUpgrade?: (customerId: string) => void
  btnLoading: boolean
  actions?: {
    [key: string]: EditionActionDTO[]
  }
}

export function getBtnProps({
  plan,
  getString,
  handleStartPlan,
  handleContactSales,
  handleExtendTrial,
  handleUpgrade,
  btnLoading,
  actions
}: GetBtnPropsProps): PlanCalculatedProps['btnProps'] {
  const btnProps: BtnProps[] = []
  const planEdition = plan?.title && (plan?.title?.toUpperCase() as Editions)
  const planActions = (planEdition && actions?.[planEdition]) || []
  planActions?.forEach(action => {
    let onClick,
      order,
      planDisabledStr: string | undefined,
      isContactSales: boolean | undefined,
      isContactSupport: boolean | undefined
    const buttonText =
      action.action && PLAN_BTN_ACTIONS[action.action] && getString(PLAN_BTN_ACTIONS[action.action] as keyof StringsMap)
    switch (action.action) {
      case 'START_FREE':
      case 'START_TRIAL':
        order = 0
        onClick = () => planEdition && handleStartPlan(planEdition)
        break
      case 'EXTEND_TRIAL':
        order = 0
        onClick = () => planEdition && handleExtendTrial(planEdition)
        break
      case 'MANAGE':
        order = 0
        onClick = handleUpgrade
        break
      case 'SUBSCRIBE':
      case 'UPGRADE':
        order = 1
        onClick = handleUpgrade
        break
      case 'CONTACT_SALES':
        order = 2
        onClick = handleContactSales
        isContactSales = true
        break
      case 'CONTACT_SUPPORT':
        order = 2
        isContactSupport = true
        break
      case 'DISABLED_BY_ENTERPRISE':
      case 'DISABLED_BY_TEAM':
        order = 0
        onClick = undefined
        planDisabledStr = action.reason
        break
      default:
        order = 0
        onClick = undefined
    }

    btnProps.push({ buttonText, onClick, btnLoading, order, planDisabledStr, isContactSales, isContactSupport })
  })

  // sort btns for display order
  btnProps.sort((btn1, btn2) => btn1.order - btn2.order)

  return btnProps
}

export const PLAN_BTN_ACTIONS: { [key in NonNullable<EditionActionDTO['action']>]?: string } = {
  START_FREE: 'common.startFree',
  START_TRIAL: 'common.start14dayTrial',
  EXTEND_TRIAL: 'common.banners.trial.expired.extendTrial',
  SUBSCRIBE: 'common.subscriptions.overview.subscribe',
  UPGRADE: 'common.upgrade',
  CONTACT_SALES: 'common.banners.trial.contactSales',
  CONTACT_SUPPORT: 'common.contactSupport',
  MANAGE: 'common.plans.manageSubscription'
}

interface GetBtnsProps {
  isPlanDisabled: boolean
  btnProps?: BtnProps[]
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
}

export function getBtns({ isPlanDisabled, btnProps, getString }: GetBtnsProps): ReactElement {
  if (isPlanDisabled) {
    return <></>
  }
  const btns: ReactElement[] = []
  const length = btnProps?.length || 0
  btnProps?.forEach(btn => {
    const { onClick, btnLoading, buttonText, isContactSales, isContactSupport } = btn

    // contact sales|support displays as link when there are other buttons
    if ((isContactSales || isContactSupport) && length > 1) {
      btns.push(
        <Layout.Horizontal spacing="small" flex={{ alignItems: 'baseline', justifyContent: 'center' }}>
          <Text>{getString('common.or')}</Text>
          <Button
            font={{ size: 'small' }}
            key={buttonText}
            onClick={onClick}
            loading={btnLoading}
            variation={ButtonVariation.LINK}
            className={css.noPadding}
          >
            {buttonText}
          </Button>
        </Layout.Horizontal>
      )
      return
    }

    // or else, just a button
    btns.push(
      <Button key={buttonText} onClick={onClick} loading={btnLoading} variation={ButtonVariation.PRIMARY}>
        {buttonText}
      </Button>
    )
  })

  return <Layout.Vertical spacing={'small'}>{...btns}</Layout.Vertical>
}

interface GetPriceTipsProps {
  timeType: PLAN_UNIT
  plan: PlanProp
  textColorClassName: string
}

export function getPriceTips({ timeType, plan, textColorClassName }: GetPriceTipsProps): React.ReactElement {
  const priceTips = timeType === PLAN_UNIT.MONTHLY ? plan?.priceTips : plan?.yearlyPriceTips
  const priceTerm = timeType === PLAN_UNIT.MONTHLY ? plan?.priceTerm : plan?.yearlyPriceTerm
  const priceTermTips = timeType === PLAN_UNIT.MONTHLY ? plan?.priceTermTips : plan?.yearlyPriceTermTips

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

interface GetPriceProps {
  plan: PlanProp
  timeType: PLAN_UNIT
  openMarketoContactSales: () => void
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
}

export function getPrice({ timeType, plan, openMarketoContactSales, getString }: GetPriceProps): React.ReactElement {
  const CUSTOM_PRICING = 'custom pricing'
  const price = timeType === PLAN_UNIT.MONTHLY ? plan?.price : plan?.yearlyPrice
  if (price?.toLowerCase() === CUSTOM_PRICING) {
    return (
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'baseline' }}>
        <Button
          onClick={openMarketoContactSales}
          variation={ButtonVariation.LINK}
          className={cx(css.noPadding, css.fontLarge)}
        >
          {getString('common.banners.trial.contactSales')}
        </Button>
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

interface UseGetUpgradeModalProps {
  subscribePlan?: Editions
  moduleName: ModuleName
  subscriptions?: SubscriptionDetailDTO[]
  customers?: CustomerDetailDTO[]
  customerId: string
}

interface UseGetUpgradeModalReturn {
  openUpgradeModal: (customerId: string) => void
}
export function useGetUpgradeModal({
  subscribePlan,
  moduleName,
  subscriptions,
  customers,
  customerId
}: UseGetUpgradeModalProps): UseGetUpgradeModalReturn {
  const { openSubscribePayModal } = useSubscribePayModal(customers)
  const { openSubscribeCalculatorModal, closeSubscribeCalculatorModal } = useSubscribeCalculatorModal({
    onReviewChange: props => {
      closeSubscribeCalculatorModal()
      openSubscribePayModal(props)
    },
    subscribeProps: {
      moduleName,
      subscribePlan,
      subscription: subscriptions?.[0]
    }
  })

  const openUpgradeModal = (): void => openSubscribeCalculatorModal(customerId)

  return {
    openUpgradeModal: openUpgradeModal as UseGetUpgradeModalReturn['openUpgradeModal']
  }
}

export function useGetCustomer(customers?: CustomerDetailDTO[]): string | undefined {
  const { currentUserInfo } = useAppStore()
  const customer = customers?.find(customerDetail => customerDetail.billingEmail === currentUserInfo.email)
  return customer?.customerId
}
