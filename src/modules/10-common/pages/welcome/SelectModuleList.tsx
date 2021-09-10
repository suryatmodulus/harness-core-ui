import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { Layout, Button, IconName } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { useUpdateAccountDefaultExperienceNG } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { Experiences } from '@common/constants/Utils'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useToaster } from '@common/components'
import { Category, PurposeActions } from '@common/constants/TrackingConstants'
import type { Module, AccountPathProps } from '@common/interfaces/RouteInterfaces'
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
  onModuleClick: (module?: Module) => void
  moduleList: ModuleProps[]
}

const SelectModuleList: React.FC<SelectModuleListProps> = ({ setStep, onModuleClick, moduleList }) => {
  const [selected, setSelected] = useState<Module>()

  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { trackEvent } = useTelemetry()
  const { showError } = useToaster()
  const { mutate: updateDefaultExperience, loading: updatingDefaultExperience } = useUpdateAccountDefaultExperienceNG({
    accountIdentifier: accountId
  })

  const handleModuleSelection = (module: Module): void => {
    setSelected(module)
    onModuleClick(module)
  }

  const handleCDContinue = (): void => {
    setStep(STEPS.MODULE_INFO)
    onModuleClick(selected)
  }
  const history = useHistory()

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

  const getContinue = (): React.ReactElement => {
    switch (selected) {
      case 'cd':
        return (
          <Button onClick={handleCDContinue} intent="primary" width={100}>
            {getString('continue')}
          </Button>
        )
      case 'ci':
      case 'ce':
      case 'cv':
      case 'cf': {
        return (
          <Button
            disabled={updatingDefaultExperience}
            intent="primary"
            className={css.continueButton}
            onClick={() => {
              trackEvent(PurposeActions.ModuleContinue, { category: Category.SIGNUP, module: selected })
              try {
                updateDefaultExperience({
                  defaultExperience: Experiences.NG
                }).then(() => history.push(routes.toModuleHome({ accountId, module: selected, source: 'purpose' })))
              } catch (error) {
                showError(error.data?.message || getString('somethingWentWrong'))
              }
            }}
          >
            {getString('continue')}
          </Button>
        )
      }
      default:
        return <></>
    }
  }

  return (
    <Layout.Vertical spacing="xxlarge">
      <Modules />
      {selected && getContinue()}
    </Layout.Vertical>
  )
}

export default SelectModuleList
