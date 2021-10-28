import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { debounce as _debounce, isEmpty as _isEmpty, defaultTo as _defaultTo } from 'lodash-es'
import { Drawer } from '@blueprintjs/core'
import { Container, Layout, Button } from '@wings-software/uicore'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import COHelpSidebar from '@ce/components/COHelpSidebar/COHelpSidebar'
import type { Service } from 'services/lw'
import { CONFIG_IDLE_TIME_CONSTRAINTS, CONFIG_STEP_IDS, CONFIG_TOTAL_STEP_COUNTS, RESOURCES } from '@ce/constants'
import DefineRule from './steps/DefineRule'
import ManageResources from './steps/ManageResources/ManageResources'
import ResourceFulfilment from './steps/ResourceFulfilment'
import AdvancedConfiguration from './steps/AdvancedConfiguration'
import { getSelectedResourceFromGatewayDetails, isActiveStep } from './helper'
import css from './COGatewayConfig.module.scss'

interface COGatewayConfigProps {
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
  valid: boolean
  setValidity: (tab: boolean) => void
  activeStepDetails?: { count?: number; tabId?: string } | null
  allServices: Service[]
}

const COGatewayConfig: React.FC<COGatewayConfigProps> = props => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [totalStepsCount, setTotalStepsCount] = useState<number>(CONFIG_TOTAL_STEP_COUNTS.DEFAULT)
  const [selectedResource, setSelectedResource] = useState<RESOURCES | null>(
    getSelectedResourceFromGatewayDetails(props.gatewayDetails)
  )

  const configContEl = useRef<HTMLDivElement>(null)
  const [activeDrawerIds, setActiveDrawerIds] = useState<string[]>([CONFIG_STEP_IDS[0], CONFIG_STEP_IDS[1]])

  const observeScrollHandler = _debounce(() => {
    const configStepsContainers: HTMLElement[] = []
    CONFIG_STEP_IDS.forEach((_id: string) => {
      const element = document.getElementById(_id)
      element && configStepsContainers.push(element)
    })
    const newActiveIds: string[] = []
    configStepsContainers.forEach((stepEl, _i) => {
      if (isActiveStep(stepEl, configContEl.current as HTMLDivElement)) {
        newActiveIds.push(stepEl.id)
      }
    })
    setActiveDrawerIds(newActiveIds)
  }, 500)

  useLayoutEffect(() => {
    {
      ;(configContEl.current as HTMLDivElement).addEventListener('scroll', observeScrollHandler)
      const el = document.getElementById(`configStep${props.activeStepDetails?.count}`)
      el?.scrollIntoView()
    }

    return () => {
      ;(configContEl.current as HTMLDivElement).removeEventListener('scroll', observeScrollHandler)
    }
  }, [])

  function isValid(): boolean {
    return (
      (props.gatewayDetails.selectedInstances.length > 0 ||
        !_isEmpty(props.gatewayDetails.routing?.instance?.scale_group) ||
        !_isEmpty(props.gatewayDetails.metadata.kubernetes_connector_id) ||
        !_isEmpty(props.gatewayDetails.routing.container_svc) ||
        !_isEmpty(props.gatewayDetails.routing.database)) &&
      props.gatewayDetails.name !== '' &&
      props.gatewayDetails.idleTimeMins >= CONFIG_IDLE_TIME_CONSTRAINTS.MIN &&
      props.gatewayDetails.idleTimeMins <= CONFIG_IDLE_TIME_CONSTRAINTS.MAX &&
      (selectedResource === RESOURCES.INSTANCES ? props.gatewayDetails.fullfilment !== '' : true) &&
      (!_isEmpty(props.gatewayDetails.deps)
        ? props.gatewayDetails.deps.every(_dep => !isNaN(_dep.dep_id) && !isNaN(_dep.delay_secs))
        : true) &&
      (props.gatewayDetails.routing.instance.scale_group
        ? (props.gatewayDetails.routing.instance.scale_group?.on_demand as number) > 0 &&
          (props.gatewayDetails.routing.instance.scale_group?.on_demand as number) <=
            (props.gatewayDetails.routing.instance.scale_group.max as number) &&
          (props.gatewayDetails.routing.instance.scale_group?.spot as number) >= 0
        : true) &&
      (selectedResource === RESOURCES.ECS
        ? _defaultTo(props.gatewayDetails.routing.container_svc?.task_count, 0) > -1
        : true)
    )
  }

  useEffect(() => {
    props.setValidity(isValid())
  }, [
    props.gatewayDetails.selectedInstances,
    props.gatewayDetails.name,
    props.gatewayDetails.idleTimeMins,
    props.gatewayDetails.fullfilment,
    props.gatewayDetails.deps,
    selectedResource,
    props.gatewayDetails.metadata.kubernetes_connector_id,
    props.gatewayDetails.routing?.instance?.scale_group,
    props.gatewayDetails.routing?.container_svc,
    props.gatewayDetails.routing?.database
  ])

  return (
    <Layout.Vertical ref={configContEl} className={css.page}>
      {/* {drawerOpen && (
        <COFixedDrawer
          topMargin={85}
          content={<COHelpSidebar pageName="configuration" activeSectionNames={activeDrawerIds} />}
          onClose={() => setDrawerOpen(false)}
        />
      )} */}
      <Drawer
        autoFocus={true}
        enforceFocus={true}
        hasBackdrop={true}
        usePortal={true}
        canOutsideClickClose={true}
        canEscapeKeyClose={true}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
        }}
        size="392px"
        style={{
          // top: '85px',
          boxShadow: 'rgb(40 41 61 / 4%) 0px 2px 8px, rgb(96 97 112 / 16%) 0px 16px 24px',
          height: '100vh',
          overflowY: 'scroll'
        }}
      >
        <Container style={{ textAlign: 'right' }}>
          <Button icon="cross" minimal onClick={_ => setDrawerOpen(false)} />
        </Container>
        <COHelpSidebar pageName="configuration" activeSectionNames={activeDrawerIds} />
      </Drawer>
      <Container style={{ paddingTop: 10 }}>
        <Layout.Vertical spacing="large" padding="large">
          <DefineRule
            gatewayDetails={props.gatewayDetails}
            setGatewayDetails={props.setGatewayDetails}
            setDrawerOpen={setDrawerOpen}
            totalStepsCount={totalStepsCount}
          />
          <ManageResources
            gatewayDetails={props.gatewayDetails}
            setGatewayDetails={props.setGatewayDetails}
            totalStepsCount={totalStepsCount}
            setTotalStepsCount={setTotalStepsCount}
            setDrawerOpen={setDrawerOpen}
            selectedResource={selectedResource}
            setSelectedResource={setSelectedResource}
          />
          <ResourceFulfilment
            gatewayDetails={props.gatewayDetails}
            setGatewayDetails={props.setGatewayDetails}
            setDrawerOpen={setDrawerOpen}
            totalStepsCount={totalStepsCount}
            selectedResource={selectedResource}
          />
          <AdvancedConfiguration
            gatewayDetails={props.gatewayDetails}
            setGatewayDetails={props.setGatewayDetails}
            totalStepsCount={totalStepsCount}
            allServices={props.allServices}
            selectedResource={selectedResource as RESOURCES}
          />
        </Layout.Vertical>
      </Container>
    </Layout.Vertical>
  )
}

export default COGatewayConfig
