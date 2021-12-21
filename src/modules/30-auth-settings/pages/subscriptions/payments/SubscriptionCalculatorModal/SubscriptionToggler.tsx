import React from 'react'
import { capitalize } from 'lodash-es'
import { Layout, Button, ButtonVariation, PillToggle, Container, Page } from '@wings-software/uicore'
import type { ModuleName } from 'framework/types/ModuleName'
import { Editions } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'
import ServiceUsageTogglerBar from './ServiceUsageTogglerBar'
import type { CurrentPlanDataProps } from './ServiceUsageTogglerBar'
import { Header } from '../paymentUtils'
import type { HeaderProps } from '../paymentUtils'

import css from './SubscriptionCalculatorModal.module.scss'

interface SubscriptionTogglerProps {
  moduleName: ModuleName
  subscribePlan: Editions
  currentPlanData: CurrentPlanDataProps
  edition: Editions
  setEdition: (value: Editions) => void
  setServicesCount: (value: number) => void
}

interface HeaderLineProps extends HeaderProps {
  edition: Editions
  setEdition: (value: Editions) => void
}

const HeaderLine = ({ moduleName, subscribePlan, edition, setEdition }: HeaderLineProps): React.ReactElement => {
  const { getString } = useStrings()

  const toolbar = (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'baseline' }}>
      <Button variation={ButtonVariation.LINK} text={getString('authSettings.compareFeatures')} />
      <PillToggle
        className={css.monthlyYearly}
        selectedView={edition}
        options={[
          {
            label: capitalize(Editions.TEAM),
            value: Editions.TEAM
          },
          {
            label: capitalize(Editions.ENTERPRISE),
            value: Editions.ENTERPRISE
          }
        ]}
        onChange={val => {
          setEdition(val)
        }}
      />
    </Layout.Horizontal>
  )

  return (
    <Page.Header
      title={<Header moduleName={moduleName} subscribePlan={subscribePlan} />}
      toolbar={toolbar}
      className={css.togglerHeader}
    />
  )
}

const SubscriptionToggler = ({
  moduleName,
  subscribePlan,
  currentPlanData,
  edition,
  setEdition,
  setServicesCount
}: SubscriptionTogglerProps): React.ReactElement => {
  return (
    <Container padding={'huge'} className={css.toggler}>
      <Layout.Vertical spacing="large">
        <HeaderLine moduleName={moduleName} subscribePlan={subscribePlan} edition={edition} setEdition={setEdition} />
        <ServiceUsageTogglerBar
          moduleName={moduleName}
          currentPlanData={currentPlanData}
          setServicesCount={setServicesCount}
        />
      </Layout.Vertical>
    </Container>
  )
}

export default SubscriptionToggler
