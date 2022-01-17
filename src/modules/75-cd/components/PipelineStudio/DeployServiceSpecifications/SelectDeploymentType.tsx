/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikProps } from 'formik'
import { noop } from 'lodash-es'
import * as Yup from 'yup'
import { Card, HarnessDocTooltip, ThumbnailSelect } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { DeploymentTypeItem } from './DeploymentInterface'
import stageCss from '../DeployStageSetupShell/DeployStage.module.scss'

interface SelectServiceDeploymentTypeProps {
  selectedDeploymentType: string
  isReadonly: boolean
  handleDeploymentTypeChange: (deploymentType: string) => void
}

export default function SelectDeploymentType(props: SelectServiceDeploymentTypeProps): JSX.Element {
  const { selectedDeploymentType, isReadonly } = props
  const { getString } = useStrings()
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const { NG_NATIVE_HELM } = useFeatureFlags()

  const supportedDeploymentTypes: DeploymentTypeItem[] = [
    {
      label: getString('serviceDeploymentTypes.kubernetes'),
      icon: 'service-kubernetes',
      value: 'Kubernetes'
    },
    {
      label: getString('pipeline.nativeHelm'),
      icon: 'service-helm',
      value: 'NativeHelm',
      disabled: !NG_NATIVE_HELM
    },
    {
      label: getString('serviceDeploymentTypes.amazonEcs'),
      icon: 'service-ecs',
      value: 'amazonEcs',
      disabled: true
    },
    {
      label: getString('serviceDeploymentTypes.amazonAmi'),
      icon: 'main-service-ami',
      value: 'amazonAmi',
      disabled: true
    },
    {
      label: getString('serviceDeploymentTypes.awsCodeDeploy'),
      icon: 'app-aws-code-deploy',
      value: 'awsCodeDeploy',
      disabled: true
    },
    {
      label: getString('serviceDeploymentTypes.winrm'),
      icon: 'command-winrm',
      value: 'winrm',
      disabled: true
    },
    {
      label: getString('serviceDeploymentTypes.awsLambda'),
      icon: 'app-aws-lambda',
      value: 'awsLambda',
      disabled: true
    },
    {
      label: getString('serviceDeploymentTypes.pcf'),
      icon: 'service-pivotal',
      value: 'pcf',
      disabled: true
    },
    {
      label: getString('serviceDeploymentTypes.ssh'),
      icon: 'secret-ssh',
      value: 'ssh',
      disabled: true
    }
  ]

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
  }, [formikRef])

  return (
    <Formik<{ deploymentType: string }>
      onSubmit={noop}
      enableReinitialize={true}
      initialValues={{ deploymentType: selectedDeploymentType }}
      validationSchema={Yup.object().shape({
        deploymentType: Yup.string().required(getString('cd.pipelineSteps.serviceTab.deploymentTypeRequired'))
      })}
    >
      {formik => {
        window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.SERVICE }))
        formikRef.current = formik
        return (
          <Card className={stageCss.sectionCard}>
            <div
              className={cx(stageCss.tabSubHeading, 'ng-tooltip-native')}
              data-tooltip-id="stageOverviewDeploymentType"
            >
              {getString('deploymentTypeText')}
              <HarnessDocTooltip tooltipId="stageOverviewDeploymentType" useStandAlone={true} />
            </div>
            <ThumbnailSelect
              className={stageCss.thumbnailSelect}
              name={'deploymentType'}
              items={supportedDeploymentTypes}
              isReadonly={isReadonly}
              onChange={props.handleDeploymentTypeChange}
            />
          </Card>
        )
      }}
    </Formik>
  )
}
