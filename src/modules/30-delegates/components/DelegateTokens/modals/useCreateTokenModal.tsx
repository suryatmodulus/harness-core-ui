/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import {
  useModalHook,
  Dialog,
  Button,
  Layout,
  FormInput,
  Container,
  Text,
  Formik,
  FormikForm,
  Color,
  PageSpinner,
  ButtonVariation
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { FormikActions } from 'formik'
import * as Yup from 'yup'
import type { IDialogProps } from '@blueprintjs/core'
import { NameSchema } from '@common/utils/Validation'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { useStrings } from 'framework/strings'
import { useCreateDelegateToken } from 'services/portal'

import css from '../DelegateTokens.module.scss'

export interface CreateTokenModalProps {
  onSuccess?: () => void
  onUserAdded?: () => void
}

export interface CreateTokenModalReturn {
  openCreateTokenModal: () => void
  closeCreateTokenModal: () => void
}

interface FormikProps {
  name: string
  tokenValue: string
}

export const useCreateTokenModal = ({ onSuccess }: CreateTokenModalProps): CreateTokenModalReturn => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const modalProps: IDialogProps = {
    isOpen: true,
    title: getString('rbac.token.createLabel'),
    enforceFocus: false,
    style: {
      width: 416,
      height: 368
    }
  }

  const { mutate: createToken, loading } = useCreateDelegateToken({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      tokenName: ''
    }
  })

  const generatedValuePlaceholder = getString('delegates.tokens.generatedValuePlaceholder')

  const onSubmit = async (values: FormikProps, formikActions: FormikActions<any>) => {
    try {
      const createTokenResponse = await createToken(undefined, {
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          tokenName: values.name
        }
      })
      formikActions.setFieldValue('tokenValue', createTokenResponse?.resource?.value || '')
      onSuccess?.()
    } catch (e) {
      formikActions.setFieldError('name', getString('delegates.tokens.tokenNameNotUnique'))
    }
    return values
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} {...modalProps} style={{ height: '100%' }}>
        <>
          {loading ? <PageSpinner /> : null}
          <Formik
            initialValues={{
              name: '',
              tokenValue: generatedValuePlaceholder
            }}
            onSubmit={onSubmit}
            formName="createTokenForm"
            validationSchema={Yup.object().shape({
              name: NameSchema({ requiredErrorMsg: getString('delegates.tokens.tokenNameRequired') }),
              tokenValue: Yup.string()
            })}
          >
            {form => {
              return (
                <FormikForm className={css.addTokenModalForm}>
                  <div className={css.addTokenModalContainer}>
                    <Layout.Vertical>
                      <FormInput.Text name="name" label={getString('name')} />
                      <Container
                        intent="primary"
                        padding="small"
                        font={{
                          align: 'center'
                        }}
                        flex
                        className={css.tokenField}
                      >
                        <Text margin={{ right: 'xxlarge' }} font="small" color={Color.BLACK}>
                          {form.values.tokenValue}
                        </Text>
                        <CopyToClipboard content={form.values.tokenValue} />
                      </Container>
                    </Layout.Vertical>
                    <Layout.Horizontal spacing="small" className={css.addTokenModalActionContainer}>
                      <Button
                        intent="primary"
                        type="submit"
                        variation={ButtonVariation.PRIMARY}
                        disabled={generatedValuePlaceholder !== form.values.tokenValue}
                      >
                        {getString('common.apply')}
                      </Button>
                      <Button
                        onClick={e => {
                          e.preventDefault()
                          hideModal()
                        }}
                        variation={ButtonVariation.TERTIARY}
                      >
                        {generatedValuePlaceholder === form.values.tokenValue
                          ? getString('cancel')
                          : getString('close')}
                      </Button>
                    </Layout.Horizontal>
                  </div>
                </FormikForm>
              )
            }}
          </Formik>
        </>
      </Dialog>
    ),
    [onSuccess]
  )
  const open = useCallback(() => {
    showModal()
  }, [showModal])

  return {
    openCreateTokenModal: open,
    closeCreateTokenModal: hideModal
  }
}
