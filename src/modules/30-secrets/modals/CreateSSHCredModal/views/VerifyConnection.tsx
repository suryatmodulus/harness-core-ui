import React, { useState } from 'react'
import * as Yup from 'yup'
import { Button, Container, Formik, FormikForm, FormInput, Text } from '@wings-software/uicore'
import type { SSHKeyValidationMetadata as ValidationMetadata } from 'services/cd-ng'

import { useStrings } from 'framework/exports'
import VerifySecret, { Status } from './VerifySecret'
interface VerifyConnectionProps {
  identifier: string
  closeModal?: () => void
}

const VerifyConnection: React.FC<VerifyConnectionProps> = ({ identifier, closeModal }) => {
  const [validationMetadata, setValidationMetadata] = useState<ValidationMetadata>()
  const { getString } = useStrings()
  const [finishStatus, setFinishStatus] = useState<Status | undefined>()

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
                  label={getString('secrets.labelHostname')}
                  disabled={!!validationMetadata}
                />
                <Text font={{ size: 'xsmall', weight: 'bold' }}>{getString('secrets.hostnameInfo').toUpperCase()}</Text>
                {validationMetadata ? null : (
                  <Button
                    type="submit"
                    text={getString('secrets.btnVerifyConnection').toUpperCase()}
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
          {finishStatus ? (
            <Button
              text={getString('secrets.verifyRetest').toUpperCase()}
              minimal
              intent="primary"
              margin={{ top: 'medium' }}
              onClick={() => {
                setValidationMetadata(undefined)
              }}
            />
          ) : null}
          <Container margin={{ top: 'large' }}>
            {finishStatus && closeModal ? (
              <Button
                text={getString('secrets.verifyFinish').toUpperCase()}
                onClick={() => {
                  closeModal()
                }}
              />
            ) : null}
          </Container>
        </Container>
      ) : null}
    </>
  )
}

export default VerifyConnection
