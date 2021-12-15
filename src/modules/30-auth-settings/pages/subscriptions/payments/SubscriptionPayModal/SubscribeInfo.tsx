import React from 'react'
import moment from 'moment'
import { capitalize } from 'lodash-es'
import { FontVariation, IconName, Layout, Text, Card, Container } from '@wings-software/uicore'
import { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import type { Editions } from '@common/constants/SubscriptionTypes'
import { PLAN_UNIT } from '@common/constants/SubscriptionTypes'
import css from './SubscriptionPayModal.module.scss'

interface SubscribeInfoProps {
  moduleName: ModuleName
  subscribePlanInfo: SubscribePlanInfo
  currentPlanInfo: CurrentPlanInfo
}

interface CurrentPlanInfo {
  currentPlan: Editions
  currentPlanInfo: {
    services?: number
  }
}

interface SubscribePlanInfo {
  subscribePlan: Editions
  services: number
  unitPrice: number
  unit: PLAN_UNIT
  premiumSupport: number
}

interface HeaderProps {
  moduleName: ModuleName
  subscribePlan: Editions
}

interface LineProps {
  label: string | number
  value: string | number
  style?: React.CSSProperties
}

const Line = ({ label, value, style }: LineProps): React.ReactElement => {
  return (
    <Layout.Horizontal padding={{ bottom: 'small' }} width="100%">
      <Text width="85%" style={style}>
        {label}
      </Text>
      <Text width="15%" style={style}>
        {value}
      </Text>
    </Layout.Horizontal>
  )
}

function getIcon(moduleName: ModuleName): string | undefined {
  switch (moduleName) {
    case ModuleName.CD:
      return 'cd-main'
    case ModuleName.CE:
      return 'ce-main'
    case ModuleName.CF:
      return 'cf-main'
    case ModuleName.CI:
      return 'ci-main'
  }
  return undefined
}

const Header = ({ moduleName, subscribePlan }: HeaderProps): JSX.Element => {
  const icon = getIcon(moduleName)
  const { getString } = useStrings()
  const subscriptionStr = getString('common.subscription')
  const header = `${moduleName} ${capitalize(subscribePlan)} ${subscriptionStr}`

  return icon ? (
    <Text
      icon={icon as IconName}
      iconProps={{ size: 28 }}
      font={{ variation: FontVariation.H3 }}
      padding={{ bottom: 'huge' }}
    >
      {header}
    </Text>
  ) : (
    <></>
  )
}

const CurrentPlan = ({ currentPlan, currentPlanInfo }: CurrentPlanInfo): JSX.Element => {
  const { getString } = useStrings()
  const header = `${capitalize(getString('common.plans.currentPlan'))} (${capitalize(currentPlan)})`
  const { services } = currentPlanInfo
  return (
    <Layout.Vertical padding={{ bottom: 'huge' }}>
      <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'medium' }}>
        {header}
      </Text>
      {services && <Line label={getString('services')} value={services} />}
    </Layout.Vertical>
  )
}

const SubscribePlan = ({
  subscribePlanInfo,
  newTotal
}: { subscribePlanInfo: SubscribePlanInfo } & { newTotal: number }): JSX.Element => {
  const { getString } = useStrings()
  const { services, subscribePlan, unitPrice, premiumSupport, unit } = subscribePlanInfo
  const serviceStr = services && `${getString('services')} (${capitalize(subscribePlan)})`
  const unitStr = unit === PLAN_UNIT.MONTHLY ? 'm' : 'y'
  const unitPriceStr = `$${unitPrice}/${unitStr}`
  const premiumSuportStr = `$${premiumSupport}/${unitStr}`
  const newTotalLblStr = getString('authSettings.newTotal', { unit: unit.toLowerCase() })
  const newTotalStr = `$${newTotal}/${unitStr}`
  const timepoint = `On ${moment().format('MMM DD, YYYY')}`

  return (
    <Layout.Vertical>
      <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'medium' }}>
        {getString('authSettings.changingTo')}
      </Text>

      {services && <Line label={serviceStr} value={services} />}
      <Line label={getString('authSettings.unitPrice')} value={unitPriceStr} />
      <Line label={getString('authSettings.premiumSupport')} value={premiumSuportStr} />

      <Layout.Horizontal width="100%">
        <Layout.Horizontal width="85%">
          <Text style={{ fontWeight: 'bold' }} padding={{ right: 'small' }}>
            {newTotalLblStr}
          </Text>
          <Text>{timepoint}</Text>
        </Layout.Horizontal>
        <Text style={{ fontWeight: 'bold' }} width="15%">
          {newTotalStr}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const Footer = ({ payment }: { payment: number }): JSX.Element => {
  const { getString } = useStrings()
  const paymentStr = `$${payment}`
  return (
    <Layout.Vertical padding={{ top: 'huge' }}>
      <Card className={css.footer}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Text font={{ variation: FontVariation.H4 }}>{getString('authSettings.payingToday')}</Text>
          <Text font={{ variation: FontVariation.H4 }}>{paymentStr}</Text>
        </Layout.Horizontal>
        <Text>{getString('authSettings.proratedForNextDays')}</Text>
      </Card>
    </Layout.Vertical>
  )
}

const SubscribeInfo = ({ moduleName, subscribePlanInfo, currentPlanInfo }: SubscribeInfoProps): React.ReactElement => {
  const { services, unitPrice, premiumSupport } = subscribePlanInfo
  function calculateNewTotal(): number {
    return services * unitPrice + premiumSupport
  }

  const newTotal = calculateNewTotal()

  return (
    <Layout.Vertical className={css.subscribeInfo}>
      <Container padding={'huge'}>
        <Header moduleName={moduleName} subscribePlan={subscribePlanInfo.subscribePlan} />
        <CurrentPlan {...currentPlanInfo} />
        <SubscribePlan subscribePlanInfo={subscribePlanInfo} newTotal={newTotal} />
      </Container>
      <Container padding={{ bottom: 'huge', left: 'xlarge', right: 'xlarge' }}>
        <Footer payment={newTotal} />
      </Container>
    </Layout.Vertical>
  )
}

export default SubscribeInfo
