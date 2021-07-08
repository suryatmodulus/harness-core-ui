import React, { useState } from 'react'
import {
  Button,
  Color,
  Container,
  Formik,
  FormikForm as Form,
  FormInput,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Text,
  TextInput
} from '@wings-software/uicore'
import * as Yup from 'yup'
import moment from 'moment'
import copy from 'copy-to-clipboard'
import { omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Callout, Checkbox } from '@blueprintjs/core'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { TokenDTO, useCreateToken, useUpdateToken } from 'services/cd-ng'
import type { ProjectPathProps, ServiceAccountPathProps } from '@common/interfaces/RouteInterfaces'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import css from '@rbac/modals/TokenModal/useTokenModal.module.scss'

interface TokenModalData {
  data?: TokenDTO
  apiKeyIdentifier: string
  isEdit?: boolean
  apiKeyType?: TokenDTO['apiKeyType']
  parentIdentifier?: string
  onSubmit?: () => void
  onClose?: () => void
}

interface TokenFormData extends TokenDTO {
  expiryDate?: string
}

const TokenForm: React.FC<TokenModalData> = props => {
  const { data: tokenData, onSubmit, onClose, isEdit, apiKeyIdentifier, apiKeyType, parentIdentifier } = props
  const { accountId, orgIdentifier, projectIdentifier, serviceAccountIdentifier } = useParams<
    ProjectPathProps & ServiceAccountPathProps
  >()
  const [expiry, setExpiry] = useState<boolean>(tokenData?.validTo ? true : false)
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: createToken, loading: saving } = useCreateToken({})
  const [token, setToken] = useState<string>()

  const { mutate: editToken, loading: updating } = useUpdateToken({
    identifier: encodeURIComponent(tokenData?.identifier || '')
  })

  const handleSubmit = async (values: TokenFormData): Promise<void> => {
    const dataToSubmit = Object.assign({}, omit(values, ['expiryDate']))
    if (expiry && values['expiryDate']) dataToSubmit['validTo'] = Date.parse(values['expiryDate'])
    try {
      if (isEdit) {
        const updated = await editToken(dataToSubmit)
        /* istanbul ignore else */ if (updated) {
          showSuccess(getString('rbac.token.form.editSuccess', { name: values.name }))
          onSubmit?.()
          onClose?.()
        }
      } else {
        const created = await createToken(dataToSubmit)
        /* istanbul ignore else */ if (created) {
          showSuccess(getString('rbac.token.form.createSuccess', { name: values.name }))
          onSubmit?.()
          setToken(created.data)
        }
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
          {isEdit ? getString('rbac.token.editLabel') : getString('rbac.token.createLabel')}
        </Text>
        <Formik<TokenFormData>
          initialValues={{
            identifier: '',
            name: '',
            description: '',
            tags: {},
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            apiKeyIdentifier,
            parentIdentifier: parentIdentifier || serviceAccountIdentifier,
            apiKeyType: apiKeyType || 'SERVICE_ACCOUNT',
            expiryDate: tokenData?.validTo ? moment(tokenData.validTo).format('MM/DD/YYYY') : '',
            ...tokenData
          }}
          formName="tokenForm"
          validationSchema={Yup.object().shape({
            name: NameSchema(),
            identifier: IdentifierSchema(),
            ...(expiry && { expiryDate: Yup.date().min(new Date()).required() })
          })}
          onSubmit={values => {
            modalErrorHandler?.hide()
            handleSubmit(values)
          }}
        >
          {formikProps => {
            return (
              <Form>
                <Container className={css.form}>
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <NameIdDescriptionTags
                    formikProps={formikProps}
                    identifierProps={{ isIdentifierEditable: !isEdit }}
                  />
                  <Layout.Vertical padding={{ top: 'small' }} spacing="medium">
                    <Checkbox
                      label={getString('rbac.token.form.expiry')}
                      checked={expiry}
                      onClick={e => setExpiry(e.currentTarget.checked)}
                    />
                    {expiry && <FormInput.Text name="expiryDate" label={getString('rbac.token.form.expiryDate')} />}

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
                      intent="primary"
                      text={isEdit ? getString('save') : getString('rbac.generateToken')}
                      type="submit"
                      disabled={saving || updating}
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

export default TokenForm
