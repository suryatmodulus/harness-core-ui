import React, { useState } from 'react'
import { Container, Layout, Button, IconName } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { Module } from '@common/interfaces/RouteInterfaces'
import ModuleCard from './ModuleCard'
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

interface SelectModuleListProps {
  setStep: (step: STEPS) => void
  setModule: (module?: Module) => void
  moduleList: ModuleProps[]
}

const SelectModuleList: React.FC<SelectModuleListProps> = ({ setStep, setModule, moduleList }) => {
  const [selected, setSelected] = useState<Module>()

  const { getString } = useStrings()

  const handleModuleSelection = (module: Module): void => {
    setSelected(module)
  }

  const handleContinue = (): void => {
    setStep(STEPS.MODULE_INFO)
    setModule(selected)
  }

  const Modules: React.FC = () => {
    return (
      <Layout.Horizontal spacing="small" className={css.moduleList}>
        {moduleList.map(option => {
          return (
            <ModuleCard
              key={option.module}
              option={option}
              onClick={handleModuleSelection}
              selected={selected === option.module}
            />
          )
        })}
      </Layout.Horizontal>
    )
  }

  return (
    <Container>
      <Modules />
      {selected && (
        <Button onClick={handleContinue} intent="primary" margin={{ top: 'xxlarge' }}>
          {getString('continue')}
        </Button>
      )}
    </Container>
  )
}

export default SelectModuleList
