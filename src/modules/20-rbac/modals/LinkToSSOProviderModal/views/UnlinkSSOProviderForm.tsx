import React, { useState } from 'react'
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
  FormInput
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useToaster } from '@common/components'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { shouldShowError } from '@common/utils/errorUtils'
import { useStrings } from 'framework/strings'
import { UserGroupDTO, useUnlinkSsoGroup } from 'services/cd-ng'
import css from '../useLinkToSSOProviderModal.module.scss'

interface UnlinkSSOProviderModalData {
  userGroupData: UserGroupDTO
  onSubmit?: () => void
}

export interface UnlinkSSOProviderFormData {
  retainMembers: boolean
}

const UnlinkSSOProviderForm: React.FC<UnlinkSSOProviderModalData> = props => {
  const { onSubmit, userGroupData } = props
  const { accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const [retainMembers, setRetainMembers] = useState(false)

  const { mutate: unlinkSsoGroup, loading } = useUnlinkSsoGroup({
    userGroupId: userGroupData.identifier,
    queryParams: {
      accountId,
      retainMembers: retainMembers
    }
  })

  const handleOnSubmit = async (): Promise<void> => {
    modalErrorHandler?.hide()
    try {
      const created = await unlinkSsoGroup({ headers: { 'content-type': 'application/json' } } as any)
      if (created) {
        showSuccess(getString('rbac.userGroupPage.successMessage', { name: userGroupData.ssoGroupName }))
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
          {getString('rbac.userDetails.linkToSSOProviderModal.delinkLabel')}
        </Text>
        <Formik<UnlinkSSOProviderFormData>
          initialValues={{ retainMembers: false }}
          onSubmit={() => {
            handleOnSubmit()
          }}
        >
          {() => {
            return (
              <Form>
                <Container margin={{ bottom: 'medium' }}>
                  <Container padding={{ bottom: 'medium' }}>
                    <ModalErrorHandler bind={setModalErrorHandler} />
                  </Container>
                  <Layout.Vertical spacing="medium">
                    <Text font={{ weight: 'semi-bold' }}>
                      {getString('rbac.userDetails.linkToSSOProviderModal.delinkText', {
                        name: userGroupData.name,
                        ssoName: userGroupData.linkedSsoDisplayName
                      })}
                    </Text>
                    <FormInput.CheckBox
                      disabled={loading}
                      className={css.checkbox}
                      name="retainMembers"
                      label={getString('rbac.userDetails.linkToSSOProviderModal.retainMembersLabel')}
                      onChange={e => {
                        setRetainMembers(e.currentTarget.checked)
                      }}
                    />
                  </Layout.Vertical>
                </Container>
                <Layout.Horizontal>
                  <Button
                    intent="primary"
                    data-testId="submitLinkSSOProvider"
                    text={getString('save')}
                    type="submit"
                    disabled={loading}
                  />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default UnlinkSSOProviderForm
