import React from 'react'
import { Formik, FormikProps } from 'formik'
import { noop } from 'lodash-es'
import * as Yup from 'yup'
import { Card, IconName, Text, GroupedThumbnailSelect } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import css from '@cd/components/PipelineStudio/DeployInfraSpecifications/DeployInfraSpecifications.module.scss'

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
          <Card className={cx(css.sectionCard, css.shadow)}>
            <Text margin={{ bottom: 'medium' }}>{getString('pipelineSteps.deploy.infrastructure.selectMethod')}</Text>
            <GroupedThumbnailSelect
              className={css.thumbnailSelect}
              name={'deploymentType'}
              onChange={onChange}
              groups={infraGroups}
              isReadonly={isReadonly}
            />
          </Card>
        )
      }}
    </Formik>
  )
}
