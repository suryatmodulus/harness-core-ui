import React, { useState } from 'react'
import {
  Button,
  Color,
  Container,
  Checkbox,
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Text,
  TextInput,
  ButtonVariation
} from '@wings-software/uicore'
import * as Yup from 'yup'
import copy from 'copy-to-clipboard'
import { useParams } from 'react-router-dom'
import { Callout } from '@blueprintjs/core'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { TokenDTO, useRotateToken } from 'services/cd-ng'
import type { ProjectPathProps, ServiceAccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from '@rbac/modals/TokenModal/useTokenModal.module.scss'

interface TokenModalData {
  data?: TokenDTO
  apiKeyIdentifier: string
  onSubmit?: () => void
  onClose?: () => void
}

interface RotateTokenFormData {
  name: string
  expiryDate?: string
}

const RotateTokenForm: React.FC<TokenModalData> = props => {
  const { data: tokenData, onSubmit, onClose, apiKeyIdentifier } = props
  const { accountId, orgIdentifier, projectIdentifier, serviceAccountIdentifier } = useParams<
    ProjectPathProps & ServiceAccountPathProps
  >()
  const [expiry, setExpiry] = useState<boolean>(tokenData?.validTo ? true : false)
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: rotateToken, loading: saving } = useRotateToken({ identifier: tokenData?.identifier || '' })
  const [token, setToken] = useState<string>()

  const handleSubmit = async (values: RotateTokenFormData): Promise<void> => {
    try {
      const rotated = await rotateToken('' as any, {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          apiKeyIdentifier,
          parentIdentifier: tokenData?.parentIdentifier || serviceAccountIdentifier,
          apiKeyType: tokenData?.apiKeyType || 'SERVICE_ACCOUNT',
          rotateTimestamp: values['expiryDate'] ? Date.parse(values['expiryDate']) : Date.now()
        }
      })
      /* istanbul ignore else */ if (rotated) {
        showSuccess(getString('rbac.token.form.rotateSuccess'))
        onSubmit?.()
        setToken(rotated.data)
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }
  return (
    <Layout.Vertical padding={{ bottom: 'xxxlarge', right: 'xxxlarge', left: 'xxxlarge' }}>
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {getString('rbac.token.rotateLabel')}
        </Text>
        <Formik<RotateTokenFormData>
          initialValues={{
            name: tokenData?.name || '',
            expiryDate: ''
          }}
          formName="RotateForm"
          validationSchema={Yup.object().shape({
            ...(expiry && { expiryDate: Yup.date().min(new Date()).required() })
          })}
          onSubmit={values => {
            modalErrorHandler?.hide()
            handleSubmit(values)
          }}
        >
          {() => {
            return (
              <Form>
                <Container className={css.form}>
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <Layout.Vertical padding={{ top: 'small' }} spacing="medium">
                    <FormInput.Text name="name" disabled label={getString('rbac.token.forToken')} />
                    <Checkbox
                      label={getString('rbac.token.form.expiry')}
                      checked={expiry}
                      onClick={e => setExpiry(e.currentTarget.checked)}
                    />
                    {expiry ? (
                      <FormInput.Text name="expiryDate" label={getString('rbac.token.form.expiryDate')} />
                    ) : (
                      <Text>{getString('rbac.token.form.rotateTokenExpiryMessage')}</Text>
                    )}
                    {token && (
                      <Layout.Vertical spacing="small" margin={{ bottom: 'medium' }}>
                        <Callout intent="success">
                          <Text>{getString('valueLabel')}</Text>
                          <TextInput
                            value={token}
                            disabled
                            rightElement={
                              (
                                <Button
                                  icon="duplicate"
                                  onClick={() => {
                                    copy(token)
                                      ? showSuccess(getString('clipboardCopySuccess'))
                                      : showError(getString('clipboardCopyFail'))
                                  }}
                                  inline
                                  minimal
                                />
                              ) as any
                            }
                          />
                          <Text>{getString('rbac.token.form.tokenMessage')}</Text>
                        </Callout>
                      </Layout.Vertical>
                    )}
                  </Layout.Vertical>
                </Container>
                <Layout.Horizontal>
                  {token ? (
                    <Button text={getString('close')} onClick={onClose} />
                  ) : (
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      text={getString('rbac.token.rotateLabel')}
                      type="submit"
                      disabled={saving}
                    />
                  )}
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default RotateTokenForm
