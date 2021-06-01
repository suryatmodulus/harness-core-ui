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
  updateInitialValue(prevData as PrevData, spec as SpecData, updatedInitialValues, 'accesskeyRef' as AllowedKeyList)

  const initValueWithSecrets = await setDatadogSecrets(updatedInitialValues, accountId)
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

export async function setDatadogSecrets(
  initialValues: SumoLogicInitialValue,
  accountId: string
): Promise<SumoLogicInitialValue> {
  const { projectIdentifier, orgIdentifier, accessIdRef, accesskeyRef } = initialValues || {}
  if (accessIdRef && typeof accessIdRef !== 'object' && accesskeyRef && typeof accesskeyRef !== 'object') {
    const resultAPIkey = await setSecretField(accessIdRef, {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    })
    const resultAPPkey = await setSecretField(accesskeyRef, {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    })
    initialValues.accessIdRef = resultAPIkey
    initialValues.accesskeyRef = resultAPPkey
  }
  return initialValues
}
