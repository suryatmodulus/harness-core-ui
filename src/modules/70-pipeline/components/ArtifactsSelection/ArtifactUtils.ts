import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { FormikValues } from 'formik'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ENABLED_ARTIFACT_TYPES } from './ArtifactHelper'
import type { ArtifactTagHelperText, ArtifactType } from './ArtifactInterface'

export enum RegistryHostNames {
  GCR_URL = 'gcr.io',
  US_GCR_URL = 'us.gcr.io',
  ASIA_GCR_URL = 'asia.gcr.io',
  EU_GCR_URL = 'eu.gcr.io',
  MIRROR_GCR_URL = 'mirror.gcr.io',
  K8S_GCR_URL = 'k8s.gcr.io',
  LAUNCHER_GCR_URL = 'launcher.gcr.io'
}

export const resetTag = (formik: FormikValues): void => {
  formik.values.tagType === 'value' &&
    getMultiTypeFromValue(formik.values.tag?.value) === MultiTypeInputType.FIXED &&
    formik.values.tag?.value?.length &&
    formik.setFieldValue('tag', '')
}

export const getConnectorIdValue = (prevStepData: ConnectorConfigDTO | undefined): string => {
  if (getMultiTypeFromValue(prevStepData?.connectorId) !== MultiTypeInputType.FIXED) {
    return prevStepData?.connectorId
  }
  if (prevStepData?.connectorId?.value) {
    return prevStepData?.connectorId?.value
  }
  return prevStepData?.identifier || ''
}

export const helperTextData = (
  selectedArtifact: ArtifactType,
  formik: FormikValues,
  connectorIdValue: string
): ArtifactTagHelperText => {
  switch (selectedArtifact) {
    case ENABLED_ARTIFACT_TYPES.DockerRegistry:
      return {
        imagePath: formik.values?.imagePath,
        connectorRef: connectorIdValue
      }
    case ENABLED_ARTIFACT_TYPES.Ecr:
      return {
        imagePath: formik.values?.imagePath,
        region: formik.values?.region || '',
        connectorRef: connectorIdValue
      }
    case ENABLED_ARTIFACT_TYPES.Gcr:
      return {
        imagePath: formik.values?.imagePath,
        registryHostname: formik.values?.registryHostname || '',
        connectorRef: connectorIdValue
      }
    default:
      return {} as ArtifactTagHelperText
  }
}
