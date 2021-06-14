import type { ConnectorConfigDTO } from 'services/cd-ng'
import { SumoLogicInitialValue, setSecretField } from '@connectors/pages/connectors/utils/ConnectorUtils'

export interface SpecData {
  url: string
  applicationKeyRef: string
  apiKeyRef: string
  delegateSelectors: string
}

export interface PrevData {
  name: string
  identifier: string
  description: string
  orgIdentifier: string
  projectIdentifier: string
  tags: any
  type: string
}

type AllowedKeyList = keyof PrevData & keyof SpecData

export async function initializeSumoLogicConnectorWithStepData(
  prevStepData: ConnectorConfigDTO | undefined,
  accountId = ''
): Promise<ConnectorConfigDTO | undefined> {
  if (!prevStepData) {
    return
  }

  const { spec, ...prevData } = prevStepData
  const updatedInitialValues = {
    ...spec,
    ...prevData
  }

  updateInitialValue(prevData as PrevData, spec as SpecData, updatedInitialValues, 'url' as AllowedKeyList)
  updateInitialValue(prevData as PrevData, spec as SpecData, updatedInitialValues, 'accessIdRef' as AllowedKeyList)
  updateInitialValue(prevData as PrevData, spec as SpecData, updatedInitialValues, 'accessKeyRef' as AllowedKeyList)

  const initValueWithSecrets = await setSecrets(updatedInitialValues, accountId)
  initValueWithSecrets.loading = false
  return initValueWithSecrets
}

function updateInitialValue(
  prevData: PrevData,
  spec: SpecData,
  updatedInitialValues: PrevData & SpecData,
  key: AllowedKeyList
): void {
  if (prevData && prevData[key]) {
    updatedInitialValues[key] = prevData[key]
  } else if (spec && spec[key]) {
    updatedInitialValues[key] = spec[key]
  }
}

export async function setSecrets(
  initialValues: SumoLogicInitialValue,
  accountId: string
): Promise<SumoLogicInitialValue> {
  const { projectIdentifier, orgIdentifier, accessIdRef, accessKeyRef } = initialValues || {}
  if (accessIdRef && typeof accessIdRef !== 'object' && accessKeyRef && typeof accessKeyRef !== 'object') {
    const resultAPIkey = await setSecretField(accessIdRef, {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    })
    const resultAPPkey = await setSecretField(accessKeyRef, {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    })
    initialValues.accessIdRef = resultAPIkey
    initialValues.accessKeyRef = resultAPPkey
  }
  return initialValues
}
