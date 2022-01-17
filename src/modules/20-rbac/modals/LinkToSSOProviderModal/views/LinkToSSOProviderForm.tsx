/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import {
  Button,
  Color,
  Container,
  Formik,
  FormikForm as Form,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Text,
  SelectOption,
  ButtonVariation,
  FormInput,
  PageError,
  shouldShowError
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import type { StringsMap } from 'framework/strings/StringsContext'
import { useToaster } from '@common/components'
import { regexName } from '@common/utils/StringUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { UserGroupDTO, SAMLSettings, useGetAuthenticationSettings, useLinkToSamlGroup } from 'services/cd-ng'
import css from '../useLinkToSSOProviderModal.module.scss'
interface LinkToSSOProviderModalData {
  userGroupData: UserGroupDTO
  onSubmit?: () => void
}

export interface LinkToSSOProviderFormData {
  groupName: string
  sso: string
}

const getSelectPlaceholder = (
  ssoSettings: SelectOption[],
  fetching: boolean,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): string => {
  const dataPlaceholder = !ssoSettings.length
    ? getString('noData')
    : getString('rbac.userDetails.linkToSSOProviderModal.selectSSOSetting')
  return fetching ? getString('loading') : dataPlaceholder
}

const LinkToSSOProviderForm: React.FC<LinkToSSOProviderModalData> = props => {
  const { onSubmit, userGroupData } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const [selectedSso, setSelectedSso] = useState<SelectOption>()

  let fetching = false
  const {
    data: authDataResponse,
    loading: authLoading,
    error,
    refetch
  } = useGetAuthenticationSettings({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const authSettingsData = authDataResponse?.resource?.ngAuthSettings as SAMLSettings[]

  const { mutate: linkSsoGroup, loading: linking } = useLinkToSamlGroup({
    userGroupId: userGroupData.identifier,
    samlId: selectedSso?.value as string,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  fetching = linking || authLoading

  const ssoSettings: SelectOption[] = useMemo(
    () =>
      ((authSettingsData || []).filter(el => el.settingsType === 'SAML' && el.authorizationEnabled) || []).map(data => {
        return {
          label: data.displayName || data.identifier,
          value: data.identifier
        }
      }) || [],
    [authSettingsData]
  )

  const handleOnSubmit = async (values: LinkToSSOProviderFormData): Promise<void> => {
    modalErrorHandler?.hide()
    try {
      const created = await linkSsoGroup({ samlGroupName: values.groupName })
      if (created) {
        showSuccess(getString('rbac.userGroupForm.createSuccess', { name: values.groupName }))
        onSubmit?.()
      }
    } catch (err) {
      if (shouldShowError(err)) {
        modalErrorHandler?.showDanger(err.data?.message || err.message)
      }
    }
  }

  return (
    <Layout.Vertical padding="xlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {getString('rbac.userDetails.linkToSSOProviderModal.linkLabel')}
        </Text>
        {error ? (
          <PageError message={(error.data as any)?.message || error.message} onClick={refetch as any} />
        ) : (
          <Formik<LinkToSSOProviderFormData>
            formName="linkToSSOProviderForm"
            initialValues={{ groupName: '', sso: '' }}
            validationSchema={Yup.object().shape({
              groupName: Yup.string()
                .trim()
                .required(getString('rbac.userDetails.linkToSSOProviderModal.validation.groupNameRequired'))
                .matches(regexName, getString('common.validation.namePatternIsNotValid')),
              sso: Yup.string().required(getString('rbac.userDetails.linkToSSOProviderModal.validation.ssoIdRequired'))
            })}
            onSubmit={values => {
              handleOnSubmit(values)
            }}
            enableReinitialize
          >
            {() => {
              return (
                <Form>
                  <Container margin={{ bottom: 'medium' }}>
                    <Container padding={{ bottom: 'medium' }}>
                      <ModalErrorHandler bind={setModalErrorHandler} />
                    </Container>
                    <Layout.Vertical spacing="medium">
                      <Layout.Vertical flex={{ alignItems: 'end' }} spacing="xsmall">
                        <FormInput.Select
                          name="sso"
                          disabled={fetching}
                          className={css.select}
                          items={ssoSettings}
                          value={selectedSso}
                          placeholder={getSelectPlaceholder(ssoSettings, fetching, getString)}
                          onChange={value => {
                            setSelectedSso(value)
                          }}
                        />
                      </Layout.Vertical>
                      <FormInput.Text
                        disabled={!selectedSso || fetching}
                        name="groupName"
                        label={getString('rbac.userDetails.linkToSSOProviderModal.groupNameLabel')}
                      />
                    </Layout.Vertical>
                  </Container>
                  <Layout.Horizontal>
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      data-testid="submitLinkSSOProvider"
                      text={getString('save')}
                      type="submit"
                      disabled={fetching}
                    />
                  </Layout.Horizontal>
                </Form>
              )
            }}
          </Formik>
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default LinkToSSOProviderForm
