import React from 'react'
import { Color, Layout } from '@wings-software/uicore'

import type {
  KerberosConfigDTO,
  SecretResponseWrapper,
  SecretTextSpecDTO,
  SSHConfigDTO,
  SSHKeyPathCredentialDTO,
  SSHKeyReferenceCredentialDTO,
  SSHKeySpecDTO,
  SSHPasswordCredentialDTO,
  TGTKeyTabFilePathSpecDTO,
  ConnectorConnectivityDetails,
  TGTPasswordSpecDTO
} from 'services/cd-ng'
import { getStringForCredentialType, getStringForType } from '@secrets/utils/SSHAuthUtils'

import sshi18n from '@secrets/components/SSHAuthFormFields/SSHAuthFormFields.i18n'
import VerifyConnection from '@secrets/modals/CreateSSHCredModal/views/VerifyConnection'
import ConnectorStats from '@common/components/ConnectorStats/ConnectorStats'
import {
  ActivityDetailsRowInterface,
  RenderDetailsTable
} from '@common/components/RenderDetailsTable/RenderDetailsTable'
import { useStrings } from 'framework/exports'
import i18n from '../SecretDetails.i18n'
import css from './ViewSecretDetails.module.scss'

interface ViewSecretDetailsProps {
  secret: SecretResponseWrapper
}

const ViewSecretDetails: React.FC<ViewSecretDetailsProps> = props => {
  const {
    secret: { secret }
  } = props
  const { getString } = useStrings()

  const getSecretDetailsRow = (): ActivityDetailsRowInterface[] => {
    return [
      { label: getString('name'), value: secret.name },
      { label: getString('common.description'), value: secret.description },
      { label: getString('identifier'), value: secret.identifier },
      { label: getString('common.tagsLabel'), value: secret.tags }
    ]
  }

  const getSecretCredentialsRow = (): ActivityDetailsRowInterface[] => {
    const items: ActivityDetailsRowInterface[] = []
    items.push({ label: i18n.labelType, value: getStringForType(secret.type) })
    if (secret.type === 'SSHKey' && (secret.spec as SSHKeySpecDTO)?.auth?.type) {
      items.push({ label: sshi18n.labelAuth, value: (secret.spec as SSHKeySpecDTO)?.auth.type })
      if ((secret.spec as SSHKeySpecDTO)?.auth.type === 'SSH') {
        items.push({
          label: sshi18n.labelCredentialType,
          value: getStringForCredentialType((secret.spec as SSHKeySpecDTO)?.auth.spec.credentialType)
        })
        items.push({
          label: sshi18n.labelUsername,
          value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).spec as SSHPasswordCredentialDTO).userName
        })
        if (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).credentialType === 'Password') {
          items.push({
            label: sshi18n.labelUsername,
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).spec as SSHPasswordCredentialDTO)
              .userName
          })
        }
        if (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).credentialType === 'KeyPath') {
          items.push({
            label: sshi18n.labelKeyFilePath,
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).spec as SSHKeyPathCredentialDTO).keyPath
          })
          items.push({
            label: sshi18n.labelPassphrase,
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).spec as SSHKeyPathCredentialDTO)
              .encryptedPassphrase
          })
        }
        if (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).credentialType === 'KeyReference') {
          items.push({
            label: sshi18n.labelKeyReference,
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).spec as SSHKeyReferenceCredentialDTO)
              .key
          })
          items.push({
            label: sshi18n.labelPassphrase,
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as SSHConfigDTO).spec as SSHKeyReferenceCredentialDTO)
              .encryptedPassphrase
          })
        }
      }
      if ((secret.spec as SSHKeySpecDTO)?.auth.type === 'Kerberos') {
        items.push({
          label: sshi18n.labelPrincipal,
          value: ((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO).principal
        })
        items.push({
          label: sshi18n.labelRealm,
          value: ((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO).realm
        })
        items.push({
          label: sshi18n.labelTGT,
          value:
            ((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO).tgtGenerationMethod || sshi18n.valueNone
        })
        if (((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO).tgtGenerationMethod === 'KeyTabFilePath') {
          items.push({
            label: sshi18n.labelKeyTab,
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO)?.spec as TGTKeyTabFilePathSpecDTO)
              ?.keyPath
          })
        }
        if (((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO).tgtGenerationMethod === 'Password') {
          items.push({
            label: sshi18n.labelPassword,
            value: (((secret.spec as SSHKeySpecDTO)?.auth.spec as KerberosConfigDTO).spec as TGTPasswordSpecDTO)
              .password
          })
        }
      }
    }

    if (secret.type === 'SecretText') {
      const secretTextSpec = secret.spec as SecretTextSpecDTO
      if (secretTextSpec.valueType == 'Inline')
        items.push({
          label: i18n.labelValue,
          value: getString('encrypted').toLowerCase(),
          valueColor: Color.GREY_350
        })
      if (secretTextSpec.valueType == 'Reference') items.push({ label: i18n.labelPath, value: secretTextSpec.value })
      items.push({ label: i18n.labelSecretManager, value: (secret.spec as SecretTextSpecDTO).secretManagerIdentifier })
    }
    if (secret.type === 'SecretFile') {
      items.push({
        label: i18n.labelValue,
        value: getString('encryptedFile').toLowerCase(),
        valueColor: Color.GREY_350
      })
      items.push({ label: i18n.labelSecretManager, value: (secret.spec as SecretTextSpecDTO).secretManagerIdentifier })
    }
    return items
  }

  return (
    <Layout.Horizontal>
      <Layout.Vertical width="60%" spacing="large">
        <Layout.Horizontal spacing="medium">
          <RenderDetailsTable
            title={getString('overview')}
            data={getSecretDetailsRow()}
            className={css.renderDetails}
          />
          <RenderDetailsTable title={'Credentials'} data={getSecretCredentialsRow()} className={css.renderDetails} />
        </Layout.Horizontal>
      </Layout.Vertical>
      {secret.type === 'SSHKey' ? (
        <Layout.Vertical width="40%" spacing="xxxlarge" border={{ left: true }} padding={{ left: 'xxxlarge' }}>
          <ConnectorStats
            createdAt={props.secret.createdAt as number}
            lastUpdated={props.secret.updatedAt}
            status={'' as ConnectorConnectivityDetails['status']}
            className={css.stats}
          />
          <VerifyConnection identifier={secret.identifier} />
        </Layout.Vertical>
      ) : null}
    </Layout.Horizontal>
  )
}

export default ViewSecretDetails
