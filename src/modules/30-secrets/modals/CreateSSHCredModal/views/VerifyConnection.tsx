import React, { useState } from 'react'
import * as Yup from 'yup'
import { Button, Container, Formik, FormikForm, FormInput, Text } from '@wings-software/uicore'
import type { SSHKeyValidationMetadata as ValidationMetadata } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import VerifySecret, { Status } from './VerifySecret'

interface VerifyConnectionProps {
  identifier: string
  closeModal?: () => void
}

const VerifyConnection: React.FC<VerifyConnectionProps> = ({ identifier, closeModal }) => {
  const [validationMetadata, setValidationMetadata] = useState<ValidationMetadata>()
  const [finishStatus, setFinishStatus] = useState<Status | undefined>()
  const { getString } = useStrings()
  return (
    <>
      <Container width={300}>
        <Formik<ValidationMetadata>
          onSubmit={formData => {
            setValidationMetadata({
              type: 'SSHKey',
              host: formData.host
            })
          }}
          formName="sshVerifyConnectionForm"
          initialValues={{
            type: 'SSHKey',
            host: ''
          }}
          validationSchema={Yup.object().shape({
            host: Yup.string().trim().required()
          })}
        >
          {() => {
            return (
              <FormikForm>
                <FormInput.Text
                  name="host"
                  label={getString('secrets.createSSHCredWizard.labelHostname')}
                  disabled={!!validationMetadata}
                />
                <Text font={{ size: 'xsmall', weight: 'bold' }}>
                  {getString('secrets.createSSHCredWizard.hostnameInfo').toUpperCase()}
                </Text>
                {validationMetadata ? null : (
                  <Button
                    type="submit"
                    text={getString('secrets.createSSHCredWizard.btnVerifyConnection')}
                    style={{ fontSize: 'smaller' }}
                    margin={{ top: 'medium' }}
                  />
                )}
              </FormikForm>
            )
          }}
        </Formik>
      </Container>
      {validationMetadata ? (
        <Container margin={{ top: 'xxlarge' }}>
          <VerifySecret
            identifier={identifier as string}
            validationMetadata={validationMetadata}
            onFinish={status => {
              setFinishStatus(status)
            }}
          />
          {finishStatus && (
            <>
              <Button
                text={getString('secrets.createSSHCredWizard.verifyRetest')}
                minimal
                intent="primary"
                margin={{ top: 'medium' }}
                onClick={() => {
                  setValidationMetadata(undefined)
                }}
              />
              <Container margin={{ top: 'large' }}>
                <Button
                  text={getString('finish').toUpperCase()}
                  onClick={() => {
                    closeModal?.()
                  }}
                />
              </Container>
            </>
          )}
        </Container>
      ) : null}
    </>
  )
}

export default VerifyConnection
