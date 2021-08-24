import React, { useState } from 'react'
import { Color, HarnessIcons, Container, Text, Layout, Heading, IconName } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { Category, PageNames } from '@common/constants/TrackingConstants'
import type { Module } from '@common/interfaces/RouteInterfaces'

import SelectModuleList from './SelectModuleList'
import ModuleInfo from './ModuleInfo'
import bgImageUrl from './images/background.svg'
import css from './WelcomePage.module.scss'

enum STEPS {
  SELECT_MODULE = 'SELECT',
  MODULE_INFO = 'MODULE'
}

interface ModuleProps {
  enabled: boolean
  titleIcon: IconName
  bodyIcon: IconName
  module: Module
}

const WelcomePage: React.FC = () => {
  const HarnessLogo = HarnessIcons['harness-logo-white']
  const { getString } = useStrings()
  const [step, setStep] = useState<STEPS>(STEPS.SELECT_MODULE)
  const [module, setModule] = useState<Module>()

  const { CVNG_ENABLED, CING_ENABLED, CFNG_ENABLED, CENG_ENABLED } = useFeatureFlags()
  const CDNG_OPTIONS: ModuleProps = {
    enabled: true, // Continous delivery is enabled in CG
    titleIcon: 'cd-with-text',
    bodyIcon: 'cd-sketch',
    module: 'cd'
  }
  const CVNG_OPTIONS: ModuleProps = {
    enabled: !!CVNG_ENABLED,
    titleIcon: 'cv-with-text',
    bodyIcon: 'cv-sketch',
    module: 'cv'
  }

  const CING_OPTIONS: ModuleProps = {
    enabled: !!CING_ENABLED,
    titleIcon: 'ci-with-text',
    bodyIcon: 'ci-sketch',
    module: 'ci'
  }

  const CENG_OPTIONS: ModuleProps = {
    enabled: !!CENG_ENABLED, // Continous efficiency is enabled in CG
    titleIcon: 'ccm-with-text',
    bodyIcon: 'ccm-sketch',
    module: 'ce'
  }

  const CFNG_OPTIONS: ModuleProps = {
    enabled: !!CFNG_ENABLED,
    titleIcon: 'ff-with-text',
    bodyIcon: 'ff-sketch',
    module: 'cf'
  }

  function getModuleProps(_module: Module): ModuleProps | undefined {
    switch (_module) {
      case 'cd':
        return { ...CDNG_OPTIONS }
      case 'cv':
        return { ...CVNG_OPTIONS }
      case 'ce':
        return { ...CENG_OPTIONS }
      case 'cf':
        return { ...CFNG_OPTIONS }
      case 'ci':
        return { ...CING_OPTIONS }
    }
  }

  const getOptions = (): ModuleProps[] => {
    const options: ModuleProps[] = []
    ;[CDNG_OPTIONS, CING_OPTIONS, CVNG_OPTIONS, CFNG_OPTIONS, CENG_OPTIONS].forEach(option => {
      if (option.enabled) {
        const { module: _module } = option
        const moduleProps = getModuleProps(_module)
        if (moduleProps) {
          options.push(moduleProps)
        }
      }
    })

    return options
  }

  useTelemetry({ pageName: PageNames.Purpose, category: Category.SIGNUP })

  const selectedModuleProps = module && getModuleProps(module)

  const body =
    step === STEPS.SELECT_MODULE ? (
      <Layout.Vertical>
        <Heading color={Color.WHITE} font={{ size: 'large', weight: 'bold' }} padding={{ top: 'xxlarge' }}>
          {getString('common.purpose.welcome')}
        </Heading>
        <Text padding={{ top: 'small', bottom: 'xxxlarge' }} color={Color.WHITE}>
          {getString('common.purpose.selectAModule')}
        </Text>
        <SelectModuleList setStep={setStep} setModule={setModule} moduleList={getOptions()} />
      </Layout.Vertical>
    ) : (
      <Layout.Vertical padding={{ top: 'xxlarge' }}>
        {selectedModuleProps && <ModuleInfo setStep={setStep} moduleProps={selectedModuleProps} />}
      </Layout.Vertical>
    )

  return (
    <Container
      padding={{ left: 'xxxlarge', top: 'xxxlarge' }}
      flex={{ alignItems: 'start' }}
      style={{ background: `transparent url(${bgImageUrl}) no-repeat` }}
      className={css.container}
    >
      <Layout.Vertical padding={{ left: 'xxlarge', top: 'xxlarge' }} spacing="large" width="100%">
        <HarnessLogo height={30} style={{ alignSelf: 'start' }} />
        {body}
      </Layout.Vertical>
    </Container>
  )
}

export default WelcomePage
