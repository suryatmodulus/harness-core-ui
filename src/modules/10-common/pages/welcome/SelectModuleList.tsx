import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router'
import type { IconName } from '@wings-software/uicore'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ModuleName } from 'framework/types/ModuleName'
import routes from '@common/RouteDefinitions'
import { useUpdateAccountDefaultExperienceNG } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { Experiences } from '@common/constants/Utils'
import { useToaster } from '@common/components'
import { Category, PurposeActions } from '@common/constants/TrackingConstants'
import type { Module, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import ModuleCard from './ModuleCard'
import css from './WelcomePage.module.scss'

interface ModuleProps {
  enabled: boolean
  titleIcon: IconName
  bodyIcon: IconName
  module: Module
  description: string
}

interface SelectModuleListProps {
  onModuleClick: (module?: Module) => void
  moduleList: ModuleProps[]
  openVersionSelection: () => void
}

const SelectModuleList: React.FC<SelectModuleListProps> = ({ onModuleClick, moduleList, openVersionSelection }) => {
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
    onModuleClick(selected)
    openVersionSelection()
    trackEvent(PurposeActions.CDModuleContinue, { category: Category.SIGNUP, module: ModuleName.CD })
  }
  const history = useHistory()

  const getButtonProps = (buttonType: string): { clickHandle?: () => void; disabled?: boolean } => {
    switch (buttonType) {
      case 'cd':
        return { clickHandle: handleCDContinue }
      case 'ci':
      case 'ce':
      case 'cv':
      case 'cf':
        return {
          clickHandle: () => {
            trackEvent(PurposeActions.ModuleContinue, { category: Category.SIGNUP, module: buttonType })
            try {
              updateDefaultExperience({
                defaultExperience: Experiences.NG
              }).then(() => history.push(routes.toModuleHome({ accountId, module: buttonType, source: 'purpose' })))
            } catch (error) {
              showError(error.data?.message || getString('somethingWentWrong'))
            }
          },
          disabled: updatingDefaultExperience
        }
      default:
        return {}
    }
  }

  const moduleListElements = moduleList.map(option => {
    const buttonProp: { clickHandle?: () => void; disabled?: boolean } = getButtonProps(option.module)

    return (
      <ModuleCard
        key={option.module}
        option={option}
        onClick={handleModuleSelection}
        selected={selected === option.module}
        buttonText={getString('continue')}
        buttonDisabled={buttonProp.disabled}
        handleButtonClick={buttonProp.clickHandle}
      />
    )
  })

  return <div className={css.moduleList}>{moduleListElements}</div>
}

export default SelectModuleList
