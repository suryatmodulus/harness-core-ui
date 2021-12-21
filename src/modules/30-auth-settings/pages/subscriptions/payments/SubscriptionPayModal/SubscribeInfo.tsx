import React from 'react'
import moment from 'moment'
import { capitalize } from 'lodash-es'
import { FontVariation, Layout, Text, Card, Container, PageSpinner, PageError, Button } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { ModuleName } from 'framework/types/ModuleName'
import { useStrings } from 'framework/strings'
import type { Editions } from '@common/constants/SubscriptionTypes'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PLAN_UNIT } from '@common/constants/SubscriptionTypes'
import { useRetrieveUpcomingInvoice, InvoiceDetailDTO } from 'services/cd-ng/index'
import { useMutateAsGet } from '@common/hooks/useMutateAsGet'
import type { NewSubscribeProps } from './useSubscribePayModal'
import { Header } from '../paymentUtils'
import css from './SubscriptionPayModal.module.scss'

interface SubscribeInfoProps {
  subscribePlan?: Editions
  unit: PLAN_UNIT
  moduleName: ModuleName
  currentPlanInfo: CurrentPlanInfo
  customerId: string
  newSubscribeProps: NewSubscribeProps[]
  showConfirm: boolean
  setConfirm: (value: boolean) => void
}

interface CurrentPlanInfo {
  currentPlan: Editions
  services?: number
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

const CurrentPlan = ({ currentPlan, services }: CurrentPlanInfo): JSX.Element => {
  const { getString } = useStrings()
  const header = `${capitalize(getString('common.plans.currentPlan'))} (${capitalize(currentPlan)})`
  return (
    <Layout.Vertical padding={{ bottom: 'huge', top: 'small' }}>
      <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'medium' }}>
        {header}
      </Text>
      {services && <Line label={getString('common.developers')} value={services} />}
    </Layout.Vertical>
  )
}

const SubscribePlan = ({ invoiceData, unit }: { invoiceData?: InvoiceDetailDTO; unit: PLAN_UNIT }): JSX.Element => {
  const { getString } = useStrings()
  const totalAmount = (invoiceData?.totalAmount || 0) / 100
  const unitStr = unit === PLAN_UNIT.MONTHLY ? 'm' : 'y'
  const newTotalLblStr = getString('authSettings.newTotal', { unit: unit.toLowerCase() })
  const newTotalStr = `$${totalAmount}/${unitStr}`
  const timepoint = `On ${moment().format('MMM DD, YYYY')}`

  return (
    <Layout.Vertical>
      <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'medium' }}>
        {getString('authSettings.changingTo')}
      </Text>
      {invoiceData?.items?.map((value, index) => {
        return <Line key={index} label={value.description || ''} value={(value.price?.unitAmount || 0) / 100 || ''} />
      })}
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

const Footer = ({
  payment,
  showConfirm,
  setConfirm
}: {
  payment?: number
  showConfirm: boolean
  setConfirm: (value: boolean) => void
}): JSX.Element => {
  const { getString } = useStrings()
  const paymentStr = `$${(payment || 0) / 100}`
  return (
    <Layout.Vertical padding={{ top: 'huge' }} spacing={'huge'}>
      <Card className={css.footer}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Text font={{ variation: FontVariation.H4 }}>{getString('authSettings.payingToday')}</Text>
          <Text font={{ variation: FontVariation.H4 }}>{paymentStr}</Text>
        </Layout.Horizontal>
        <Text>{getString('authSettings.proratedForNextDays')}</Text>
      </Card>
      {showConfirm && (
        <Button
          intent="primary"
          onClick={() => {
            setConfirm(true)
          }}
        >
          {getString('authSettings.confirmSubscription')}
        </Button>
      )}
    </Layout.Vertical>
  )
}

const SubscribeInfo = ({
  subscribePlan,
  unit,
  moduleName,
  customerId,
  currentPlanInfo,
  newSubscribeProps,
  showConfirm,
  setConfirm
}: SubscribeInfoProps): React.ReactElement => {
  const { accountId } = useParams<AccountPathProps>()
  const {
    data: invoiceData,
    loading: gettingInvoice,
    refetch: getInvoice,
    error: getInvoiceErrors
  } = useMutateAsGet(useRetrieveUpcomingInvoice, {
    queryParams: {
      accountIdentifier: accountId
    },
    body: {
      customerId,
      moduleType: moduleName,
      items: newSubscribeProps
    }
  })

  if (gettingInvoice) {
    return <PageSpinner />
  }

  if (getInvoiceErrors) {
    return <PageError message={getInvoiceErrors.message} onClick={() => getInvoice()} />
  }

  return (
    <Layout.Vertical className={css.subscribeInfo}>
      <Container padding={'huge'}>
        <Header moduleName={moduleName} subscribePlan={subscribePlan} />
        <CurrentPlan {...currentPlanInfo} />
        <SubscribePlan invoiceData={invoiceData?.data} unit={unit} />
      </Container>
      <Container padding={{ bottom: 'huge', left: 'xlarge', right: 'xlarge' }}>
        <Footer payment={invoiceData?.data?.amountDue} showConfirm={showConfirm} setConfirm={setConfirm} />
      </Container>
    </Layout.Vertical>
  )
}

export default SubscribeInfo
