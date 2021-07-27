import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Heading, Layout, StepProps } from '@wings-software/uicore'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import CopyCodeSection from './components/CopyCodeSection'
import css from './CEK8sConnector.module.scss'

interface SecretCreationStepProps {
  name: string
}

interface StepSecretManagerProps extends ConnectorInfoDTO {
  spec: any
}

const SecretCreationStep: React.FC<StepProps<StepSecretManagerProps> & SecretCreationStepProps> = props => {
  const { prevStepData, nextStep, previousStep } = props

  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  const [secretYaml] = useState<string>(
    yamlStringify({
      apiVersion: 'v1',
      data: {
        token: '<paste token here>'
      },
      kind: 'Secret',
      metadata: {
        name: 'harness-api-key',
        namespace: 'harness-autostopping'
      },
      type: 'Opaque'
    })
  )

  const handleprev = () => {
    previousStep?.({ ...prevStepData } as ConnectorInfoDTO)
  }

  const handleSubmit = () => {
    nextStep?.({ ...prevStepData } as ConnectorInfoDTO)
  }

  return (
    <Layout.Vertical className={css.secretCreationCont}>
      <Heading level={2} className={css.header}>
        {'Secret Creation'}
      </Heading>
      <ol type="1">
        <li>
          Create an api key{' '}
          <a
            href={`${window.location.origin}/#/account/${accountId}/access-management/api-keys`}
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
        </li>
        <li>Run the following command to create namespace</li>
        <CopyCodeSection snippet={'kubectl create namespace harness-autostopping'} />
        <li>Replace the api key in the following Yaml</li>
        <CopyCodeSection snippet={`${secretYaml}`} />
        <li>Run the following command</li>
        <CopyCodeSection snippet={'kubectl apply -f secret.yaml'} />
      </ol>
      <Layout.Horizontal className={css.buttonPanel} spacing="small">
        <Button text={getString('previous')} icon="chevron-left" onClick={handleprev}></Button>
        <Button
          type="submit"
          intent="primary"
          text={getString('continue')}
          rightIcon="chevron-right"
          onClick={handleSubmit}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default SecretCreationStep
