/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikProps } from 'formik'
import { noop } from 'lodash-es'
import * as Yup from 'yup'
import { IconName, GroupedThumbnailSelect } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import css from './SelectInfrastructureType.module.scss'

interface InfrastructureItem {
  label: string
  icon: IconName
  value: string
  disabled?: boolean
}

interface InfrastructureGroup {
  groupLabel: string
  items: InfrastructureItem[]
}

interface SelectDeploymentTypeProps {
  selectedInfrastructureType?: string
  onChange: (deploymentType: string | undefined) => void
  isReadonly: boolean
}

export default function SelectDeploymentType(props: SelectDeploymentTypeProps): JSX.Element {
  const { selectedInfrastructureType, onChange, isReadonly } = props
  const { getString } = useStrings()
  const infraGroups: InfrastructureGroup[] = [
    {
      groupLabel: getString('pipelineSteps.deploy.infrastructure.directConnection'),
      items: [
        {
          label: getString('pipelineSteps.deploymentTypes.kubernetes'),
          icon: 'service-kubernetes',
          value: 'KubernetesDirect'
        }
      ]
    },
    {
      groupLabel: getString('pipelineSteps.deploy.infrastructure.viaCloudProvider'),
      items: [
        {
          label: getString('pipelineSteps.deploymentTypes.gk8engine'),
          icon: 'google-kubernetes-engine',
          value: 'KubernetesGcp'
        }
      ]
    }
  ]

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [])

  return (
    <Formik<{ deploymentType?: string }>
      onSubmit={noop}
      initialValues={{ deploymentType: selectedInfrastructureType }}
      enableReinitialize
      validationSchema={Yup.object().shape({
        deploymentType: Yup.string().required(getString('cd.pipelineSteps.infraTab.deploymentType'))
      })}
    >
      {formik => {
        window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
        formikRef.current = formik
        return (
          <GroupedThumbnailSelect
            className={css.thumbnailSelect}
            name={'deploymentType'}
            onChange={onChange}
            groups={infraGroups}
            isReadonly={isReadonly}
          />
        )
      }}
    </Formik>
  )
}
