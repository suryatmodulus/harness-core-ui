/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import ProviderOverviewStep from '../ProviderOverviewStep/ProviderOverviewStep'
import type { BaseProviderStepProps } from '../../types'
import TestConnection from '../TestConnection/TestConnection'

import css from './CreateProvider.module.scss'

type PickedProps = 'isEditMode' | 'onLaunchArgoDashboard' | 'provider' | 'onUpdateMode' | 'onClose'

type CreateArgoProviderProps = Pick<BaseProviderStepProps, PickedProps>

const CreateArgoProvider: React.FC<CreateArgoProviderProps> = props => {
  const { getString } = useStrings()

  return (
    <StepWizard
      icon={'argo'}
      iconProps={{ size: 50 }}
      title={getString('cd.gitOpsWizardTitle')}
      className={css.stepWizard}
    >
      <ProviderOverviewStep name={getString('overview')} {...props} />
      <TestConnection {...props} name={getString('common.labelTestConnection')} />
    </StepWizard>
  )
}

export default CreateArgoProvider
