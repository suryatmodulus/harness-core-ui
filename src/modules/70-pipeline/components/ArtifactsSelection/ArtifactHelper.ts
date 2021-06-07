import * as Yup from 'yup'

import type { IconName } from '@wings-software/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { StringKeys } from 'framework/strings'
import { useStrings } from 'framework/strings'

import { StringUtils } from '@common/exports'
import type { ArtifactType } from './ArtifactInterface'

export const ArtifactIconByType: Record<ArtifactType, IconName> = {
  DockerRegistry: 'service-dockerhub',
  Gcr: 'service-gcp',
  Ecr: 'ecr-step'
}
export const ArtifactTitleIdByType: Record<ArtifactType, StringKeys> = {
  DockerRegistry: 'dockerRegistry',
  Gcr: 'connectors.GCR.name',
  Ecr: 'connectors.ECR.name'
}

export const ENABLED_ARTIFACT_TYPES: { [key: string]: ArtifactType } = {
  DockerRegistry: 'DockerRegistry',
  Gcr: 'Gcr',
  Ecr: 'Ecr'
}

export const ArtifactToConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  DockerRegistry: Connectors.DOCKER,
  Gcr: Connectors.GCP,
  Ecr: Connectors.AWS
}

export const ArtifactConnectorLabelMap: Record<string, string> = {
  DockerRegistry: 'DockerRegistry',
  Gcr: 'GCP',
  Ecr: 'AWS'
}

export const tagOptions: IOptionProps[] = [
  {
    label: 'Value',
    value: 'value'
  },
  {
    label: 'Regex',
    value: 'regex'
  }
]

export const ArtifactIdentifierValidation = (
  artifactIdentifiers: string[],
  id: string | undefined,
  validationMsg: string
): { identifier: Yup.Schema<unknown> } => {
  const { getString } = useStrings()

  if (!id) {
    return {
      identifier: Yup.string()
        .trim()
        .required(getString('artifactsSelection.validation.sidecarId'))
        .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
        .notOneOf(StringUtils.illegalIdentifiers)
        .notOneOf(artifactIdentifiers, validationMsg)
    }
  }
  return {
    identifier: Yup.string()
      .trim()
      .required(getString('validation.identifierRequired'))
      .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
      .notOneOf(StringUtils.illegalIdentifiers)
  }
}
