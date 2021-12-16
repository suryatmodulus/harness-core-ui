import React, { useState } from 'react'
import { capitalize } from 'lodash-es'
import { Layout, Button, ButtonVariation, PillToggle, Container, Page } from '@wings-software/uicore'
import type { ModuleName } from 'framework/types/ModuleName'
import { Editions } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'
import ServiceUsageTogglerBar from './ServiceUsageTogglerBar'
import { Header } from '../paymentUtils'
import type { HeaderProps } from '../paymentUtils'

import css from './SubscriptionCalculatorModal.module.scss'

interface SubscriptionTogglerProps {
  moduleName: ModuleName
  subscribePlan: Editions
}

const HeaderLine = ({ moduleName, subscribePlan }: HeaderProps): React.ReactElement => {
  const [edition, setEdition] = useState<Editions>(Editions.TEAM)

  const { getString } = useStrings()

  const toolbar = (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'baseline' }}>
      <Button variation={ButtonVariation.LINK} text={getString('authSettings.compareFeatures')} />
      <PillToggle
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

const SubscriptionToggler = ({ moduleName, subscribePlan }: SubscriptionTogglerProps): React.ReactElement => {
  return (
    <Container padding={'huge'} className={css.toggler}>
      <Layout.Vertical spacing="large">
        <HeaderLine moduleName={moduleName} subscribePlan={subscribePlan} />
        <ServiceUsageTogglerBar moduleName={moduleName} />
      </Layout.Vertical>
    </Container>
  )
}

export default SubscriptionToggler
