import React, { useEffect, useState } from 'react'
import { Button, Layout, Toggle } from '@wings-software/uicore'
import { CONFIG_STEP_IDS, RESOURCES } from '@ce/constants'
import { useStrings } from 'framework/strings'
import { Utils } from '@ce/common/Utils'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import type { Service, ServiceDep } from 'services/lw'
import COGatewayConfigStep from '../COGatewayConfigStep'
import CORuleDendencySelector from '../CORuleDependencySelector'

interface AdvancedConfigurationProps {
  selectedResource: RESOURCES
  totalStepsCount: number
  gatewayDetails: GatewayDetails
  setGatewayDetails: (details: GatewayDetails) => void
  allServices: Service[]
}

const AdvancedConfiguration: React.FC<AdvancedConfigurationProps> = props => {
  const { getString } = useStrings()

  const [serviceDependencies, setServiceDependencies] = useState<ServiceDep[]>(props.gatewayDetails.deps || [])

  const isK8sSelected = props.selectedResource === RESOURCES.KUBERNETES
  const isAwsProvider = Utils.isProviderAws(props.gatewayDetails.provider)

  useEffect(() => {
    props.setGatewayDetails({ ...props.gatewayDetails, deps: serviceDependencies })
  }, [serviceDependencies])

  const addDependency = () => {
    serviceDependencies.push({
      delay_secs: 5 // eslint-disable-line
    })
    const deps = [...serviceDependencies]
    setServiceDependencies(deps)
  }

  return (
    <COGatewayConfigStep
      count={props.totalStepsCount}
      title={`${getString('ce.co.autoStoppingRule.configuration.step4.setup')} ${getString(
        'ce.co.autoStoppingRule.configuration.step4.advancedConfiguration'
      )}`}
      subTitle={getString('ce.co.gatewayConfig.advancedConfigDescription')}
      totalStepsCount={props.totalStepsCount}
      id={CONFIG_STEP_IDS[3]}
      dataTooltip={{ titleId: isAwsProvider ? 'awsSetupAdvancedConfig' : 'azureSetupAdvancedConfig' }}
    >
      <Layout.Vertical spacing="medium">
        {isK8sSelected && (
          <Toggle
            label={'Hide Progress Page'}
            checked={props.gatewayDetails.opts.hide_progress_page}
            onToggle={isToggled => {
              props.setGatewayDetails({
                ...props.gatewayDetails,
                opts: { ...props.gatewayDetails.opts, hide_progress_page: isToggled }
              })
            }}
            data-testid={'progressPageViewToggle'}
          />
        )}
        {serviceDependencies && serviceDependencies.length ? (
          <CORuleDendencySelector
            deps={serviceDependencies}
            setDeps={setServiceDependencies}
            service_id={props.gatewayDetails.id}
            allServices={props.allServices}
          ></CORuleDendencySelector>
        ) : null}
        <Button
          intent="none"
          onClick={() => {
            addDependency()
          }}
          icon={'plus'}
          style={{ maxWidth: '180px' }}
        >
          {' add dependency'}
        </Button>
      </Layout.Vertical>
    </COGatewayConfigStep>
  )
}

export default AdvancedConfiguration
