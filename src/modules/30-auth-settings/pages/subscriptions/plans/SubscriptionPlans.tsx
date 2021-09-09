import React from 'react'
import { Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { FetchPlansQuery, useFetchPlansQuery } from 'services/common/services'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import Plans from './Plans'

interface SubscriptionPlansProps {
  module: ModuleName
}

interface PlanTabsProps {
  module: ModuleName
  plans?: FetchPlansQuery['pricing']
}

const PlanTabs: React.FC<PlanTabsProps> = ({ module, plans }) => {
  const getPlanByModule = (): React.ReactElement => {
    switch (module) {
      case ModuleName.CI:
        return (
          <Plans
            module={module}
            plans={plans?.ciSaasPlans}
            featureCaption={plans?.ciSaasFeatureCaption}
            featureGroup={plans?.ciSaasFeatureGroup}
          />
        )
      case ModuleName.CF:
        return (
          <Plans
            module={module}
            plans={plans?.ffPlans}
            featureCaption={plans?.ffFeatureCaption}
            featureGroup={plans?.ffFeatureGroup}
          />
        )
      case ModuleName.CD:
        return (
          <Plans
            module={module}
            plans={plans?.cdPlans}
            featureCaption={plans?.cdFeatureCaption}
            featureGroup={plans?.cdFeatureGroup}
          />
        )
      case ModuleName.CE:
        return (
          <Plans
            module={module}
            plans={plans?.ccPlans}
            featureCaption={plans?.ccFeatureCaption}
            featureGroup={plans?.ccFeatureGroup}
          />
        )
    }
    return <></>
  }

  return getPlanByModule()
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ module }) => {
  const [result, executeQuery] = useFetchPlansQuery()
  const { data, fetching, error } = result
  const { getString } = useStrings()

  if (fetching) {
    return <PageSpinner />
  }

  if (error) {
    return (
      <PageError
        message={error.message || getString('somethingWentWrong')}
        onClick={() =>
          executeQuery({
            requestPolicy: 'cache-and-network'
          })
        }
      />
    )
  }

  return (
    <Layout.Vertical width={'90%'}>
      <PlanTabs module={module} plans={data?.pricing} />
    </Layout.Vertical>
  )
}

export default SubscriptionPlans
