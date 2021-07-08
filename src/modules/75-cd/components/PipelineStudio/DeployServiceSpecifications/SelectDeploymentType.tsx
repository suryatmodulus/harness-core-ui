import React from 'react'
import { Formik, FormikProps } from 'formik'
import { noop } from 'lodash-es'
import * as Yup from 'yup'
import { Card, HarnessDocTooltip, IconName, ThumbnailSelect } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import css from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceSpecifications.module.scss'

interface DeploymentTypeItem {
  label: string
  icon: IconName
  value: string
  disabled?: boolean
}

interface SelectServiceDeploymentTypeProps {
  selectedDeploymentType: string
  isReadonly: boolean
}

export default function SelectDeploymentType(props: SelectServiceDeploymentTypeProps): JSX.Element {
  const { selectedDeploymentType, isReadonly } = props
  const { getString } = useStrings()
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const supportedDeploymentTypes: DeploymentTypeItem[] = [
    {
      label: getString('serviceDeploymentTypes.kubernetes'),
      icon: 'service-kubernetes',
      value: 'kubernetes'
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
          <Card className={cx(css.sectionCard, css.shadow)}>
            <div className={cx(css.tabSubHeading, 'ng-tooltip-native')} data-tooltip-id="stageOverviewDeploymentType">
              {getString('deploymentTypeText')}
              <HarnessDocTooltip tooltipId="stageOverviewDeploymentType" useStandAlone={true} />
            </div>
            <ThumbnailSelect
              className={css.thumbnailSelect}
              name={'deploymentType'}
              items={supportedDeploymentTypes}
              isReadonly={isReadonly}
            />
          </Card>
        )
      }}
    </Formik>
  )
}
