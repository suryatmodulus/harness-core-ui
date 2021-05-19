import React, { useState } from 'react'
import set from 'lodash-es/set'
import { useParams } from 'react-router'
import { Button, Layout } from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ScopingRuleDetails } from 'services/portal'
import { useStrings } from 'framework/strings'
import type { DelegateProfileDetailsNg } from 'services/cd-ng'
import type { dataObj } from '../CreateDelegateConfigWizard'
import DelegateConfigScope from '../../DelegateConfigScope'

import css from './DelegateConfigSteps.module.scss'

interface DelegateConfigScopeStepProps {
  name?: string
  previousStep?: (data: dataObj) => void
  prevStepData?: dataObj
  onFinish: (data: DelegateProfileDetailsNg) => void
}

const DelegateConfigScopeStep: React.FC<DelegateConfigScopeStepProps> = ({ onFinish, previousStep, prevStepData }) => {
  const { getString } = useStrings()
  const [scopingRules, setScoppingRules] = useState([] as ScopingRuleDetails[])
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const onPreviousStep = () => {
    previousStep?.({ ...prevStepData })
  }

  const createDelegateProfile = () => {
    const delegateProfileData = {
      name: prevStepData?.name,
      description: prevStepData?.description,
      selectors: Object.keys(prevStepData?.tags || {}),
      startupScript: prevStepData?.script,
      scopingRules: scopingRules
    }
    if (orgIdentifier) {
      set(delegateProfileData, 'orgIdentifier', orgIdentifier)
    }
    if (projectIdentifier) {
      set(delegateProfileData, 'projectIdentifier', projectIdentifier)
    }

    onFinish(delegateProfileData)
  }

  const onScopeChange = (newScopingRules: ScopingRuleDetails[]) => {
    setScoppingRules(newScopingRules)
  }

  return (
    <Layout.Vertical className={css.stepContainer} padding="xxlarge">
      <DelegateConfigScope onChange={onScopeChange} />
      <Layout.Horizontal spacing="xsmall">
        <Button type="button" text={getString('back')} onClick={onPreviousStep} />
        <Button type="button" intent="primary" text={getString('finish')} onClick={createDelegateProfile} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default DelegateConfigScopeStep
