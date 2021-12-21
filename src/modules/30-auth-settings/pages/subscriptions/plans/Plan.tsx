import React from 'react'
import { isEmpty } from 'lodash-es'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { Card, Layout, Text, Color, PageSpinner, Popover, PageError } from '@wings-software/uicore'
import cx from 'classnames'
import { useHistory, useParams } from 'react-router-dom'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components'
import {
  useStartTrialLicense,
  useStartFreeLicense,
  ResponseModuleLicenseDTO,
  useExtendTrialLicense,
  StartFreeLicenseQueryParams,
  StartTrialDTO,
  LicensesWithSummaryDTO,
  EditionActionDTO,
  SubscriptionDetailDTO,
  CustomerDetailDTO
} from 'services/cd-ng'
import { handleUpdateLicenseStore, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ModuleName } from 'framework/types/ModuleName'
import SvgInline from '@common/components/SvgInline/SvgInline'
import type { PLAN_UNIT } from '@common/constants/SubscriptionTypes'
import routes from '@common/RouteDefinitions'
import { Category, TrialActions, PlanActions } from '@common/constants/TrackingConstants'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { ModuleLicenseType, Editions } from '@common/constants/SubscriptionTypes'
import { getBtns, getPriceTips, getPrice, getBtnProps, useGetUpgradeModal } from './planUtils'
import type { PlanProp, PlanCalculatedProps } from './planUtils'
import CurrentPlanHeader from './CurrentPlanHeader'
import css from './Plan.module.scss'
interface PlanProps {
  plan: PlanProp
  timeType: PLAN_UNIT
  moduleName: ModuleName
  licenseData?: LicensesWithSummaryDTO
  actionsData?: {
    [key: string]: EditionActionDTO[]
  }
  subscriptions?: SubscriptionDetailDTO[]
  customers?: CustomerDetailDTO[]
  customerId: string
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

const Plan: React.FC<PlanProps> = ({
  plan,
  timeType,
  moduleName,
  licenseData,
  actionsData,
  subscriptions,
  customers,
  customerId
}) => {
  const planEdition = (plan?.title && (plan.title.toUpperCase() as Editions)) || undefined
  const module = moduleName.toLowerCase() as Module

  const { openUpgradeModal } = useGetUpgradeModal({
    subscribePlan: planEdition,
    moduleName,
    subscriptions,
    customers,
    customerId
  })

  const { accountId } = useParams<AccountPathProps>()
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  const { mutate: startTrial, loading: startingTrial } = useStartTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { mutate: startFreePlan, loading: startingFreePlan } = useStartFreeLicense({
    queryParams: {
      accountIdentifier: accountId,
      moduleType: moduleName as StartFreeLicenseQueryParams['moduleType']
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { trackEvent } = useTelemetry()
  const history = useHistory()

  const { openMarketoContactSales, loading: loadingContactSales } = useContactSalesMktoModal({})

  const { mutate: extendTrial, loading: extendingTrial } = useExtendTrialLicense({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  function startPlanByEdition(edition: Editions): Promise<ResponseModuleLicenseDTO> {
    switch (edition) {
      case Editions.FREE: {
        trackEvent(PlanActions.StartFreeClick, { category: Category.SIGNUP, module, plan: edition })
        return startFreePlan()
      }
      case Editions.ENTERPRISE:
      case Editions.TEAM:
      default: {
        trackEvent(TrialActions.StartTrialClick, { category: Category.SIGNUP, module, plan: edition })
        return startTrial({ moduleType: moduleName as StartTrialDTO['moduleType'], edition })
      }
    }
  }

  async function handleStartPlan(edition: Editions): Promise<void> {
    try {
      const planData = await startPlanByEdition(edition)

      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, planData?.data)

      let search
      if (planData?.data?.licenseType === ModuleLicenseType.TRIAL) {
        search = `?experience=${ModuleLicenseType.TRIAL}&&modal=${ModuleLicenseType.TRIAL}`
      }

      if (edition === Editions.FREE) {
        search = `?experience=${ModuleLicenseType.FREE}&&modal=${ModuleLicenseType.FREE}`
      }

      if (moduleName === ModuleName.CE) {
        history.push({
          pathname: routes.toModuleTrialHome({ accountId, module }),
          search
        })
        return
      }

      history.push({
        pathname: routes.toModuleHome({ accountId, module }),
        search
      })
    } catch (ex) {
      showError(ex.data?.message)
    }
  }

  function getPlanCalculatedProps(): PlanCalculatedProps {
    let isCurrentPlan, isTrial, isPaid

    if (licenseData?.edition === planEdition) {
      isCurrentPlan = true
    }

    switch (licenseData?.licenseType) {
      case ModuleLicenseType.PAID:
        isPaid = true
        break
      case ModuleLicenseType.TRIAL:
        isTrial = true
        break
    }
    const btnLoading = extendingTrial || startingTrial || startingFreePlan

    const handleExtendTrial = async (edition: Editions): Promise<void> => {
      try {
        const extendTrialData = await extendTrial({
          moduleType: moduleName as StartTrialDTO['moduleType'],
          edition
        })
        handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, extendTrialData?.data)
      } catch (err) {
        showError(err.data?.message || err.message)
      }
    }

    const btnProps = getBtnProps({
      plan,
      getString,
      handleStartPlan,
      handleContactSales: openMarketoContactSales,
      handleExtendTrial,
      handleUpgrade: openUpgradeModal,
      btnLoading,
      actions: actionsData
    })

    return {
      currentPlanProps: {
        isCurrentPlan,
        isTrial,
        isPaid
      },
      btnProps
    }
  }

  const { currentPlanProps, btnProps } = getPlanCalculatedProps()
  const url = `https://cms.harness.io${plan?.img?.url}`
  const hasUnit = !isEmpty(plan?.unit) && plan?.price?.toLowerCase() !== CUSTOM_PRICING

  const { isCurrentPlan, isTrial, isPaid } = currentPlanProps || {}
  const { planDisabledStr } = btnProps?.find(btnProp => btnProp.planDisabledStr) || {}
  const isPlanDisabled = planDisabledStr !== undefined

  const currentPlanClassName = isCurrentPlan ? css.currentPlan : undefined
  const currentPlanBodyClassName = isCurrentPlan ? css.currentPlanBody : undefined
  const iConClassName = cx(css.icon, textColorMap[module])
  const textColorClassName = textColorMap[module]
  const borderClassName = isCurrentPlan ? borderMap[module] : undefined

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
          module={moduleName}
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
              {plan?.title}
            </Text>
          </Popover>
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
    </Card>
  )
}

export default Plan
