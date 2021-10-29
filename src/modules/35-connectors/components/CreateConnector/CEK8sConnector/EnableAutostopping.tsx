import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Heading, Layout, StepProps, Text } from '@wings-software/uicore'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { useMutateAsGet } from '@common/hooks'
import { useCloudCostCapabilityCheck } from 'services/ce'
import css from './CEK8sConnector.module.scss'

interface StepSecretManagerProps extends ConnectorInfoDTO {
  spec: any
}

interface EnableAutostopppingProps {
  name: string
  isEditMode: boolean
  setPermissionRequired: (val: boolean) => void
}

enum Features {
  VISIBILITY,
  OPTIMIZATION
}

export type FeaturesString = keyof typeof Features

const EnableAutostoppping: React.FC<StepProps<StepSecretManagerProps> & EnableAutostopppingProps> = props => {
  const { prevStepData, nextStep, previousStep } = props
  const { getString } = useStrings()
  const { accountId } = useParams<{ accountId: string }>()
  const [enableFlag, setEnableFlag] = useState<string>('yes')
  // const data = {
  //   "identifier": "testtokenapi",
  //   "name": "testtokenapi",
  //   "description": "",
  //   "tags": {},
  //   "accountIdentifier": "kmpySmUISimoRrJL6NL73w",
  //   "apiKeyIdentifier": "testkey",
  //   "parentIdentifier": "lv0euRhKRCyiXWzS7pOg6g",
  //   "apiKeyType": "USER"
  // }

  const { data: capabilityCheckData, loading } = useMutateAsGet(useCloudCostCapabilityCheck, {
    queryParams: { accountIdentifier: accountId },
    body: {
      connectorIdentifier: prevStepData?.spec?.connectorRef
    }
  })

  const handleprev = () => {
    previousStep?.({ ...prevStepData } as ConnectorInfoDTO)
  }

  const handleSubmit = () => {
    const featuresEnabled: FeaturesString[] = []
    const includeOptimization = enableFlag === getString('yes')
    const includeVisibility = capabilityCheckData?.data?.status === 'SUCCESS'
    const newspec = {
      ...prevStepData?.spec,
      featuresEnabled,
      meta: {
        includeOptimization,
        includeVisibility
      }
    }
    const payload = prevStepData
    if (payload) payload.spec = newspec

    if (includeOptimization || includeVisibility) {
      props.setPermissionRequired(true)
    }
    nextStep?.(payload)
  }

  const handleRadioSelection = (event: React.FormEvent<HTMLInputElement>) => {
    const flag = event.currentTarget.value
    setEnableFlag(flag)
  }

  return (
    <Layout.Vertical className={css.featureSelectionCont} spacing="large">
      <Heading level={2} className={css.header}>
        {getString('connectors.ceK8.enableAutostopping.title')}
        <span style={{ fontStyle: 'italic' }}>(optional)</span>
      </Heading>
      <Text>{getString('connectors.ceK8.enableAutostopping.infoDesc')}</Text>
      <div>
        <Text>{getString('connectors.ceK8.enableAutostopping.shoudlEnableAs')}</Text>
        <RadioGroup inline onChange={handleRadioSelection} selectedValue={enableFlag}>
          <Radio label={getString('yes')} value={getString('yes')} />
          <Radio label={getString('no')} value={getString('no')} />
        </RadioGroup>
      </div>
      <Layout.Horizontal className={css.buttonPanel} spacing="small">
        <Button text={getString('previous')} icon="chevron-left" onClick={handleprev}></Button>
        <Button
          type="submit"
          intent="primary"
          text={getString('continue')}
          rightIcon="chevron-right"
          onClick={handleSubmit}
          disabled={loading}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default EnableAutostoppping
