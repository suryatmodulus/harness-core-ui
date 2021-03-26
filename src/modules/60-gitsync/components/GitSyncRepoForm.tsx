import React, { useState } from 'react'
import {
  Layout,
  Button,
  Formik,
  Text,
  ModalErrorHandler,
  FormikForm,
  ModalErrorHandlerBinding,
  Container,
  Color,
  Icon,
  FormInput,
  IconName,
  Card
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { noop, pick } from 'lodash-es'
import { useToaster } from '@common/exports'
import { usePostGitSync, GitSyncConfig } from 'services/cd-ng'

import { useStrings } from 'framework/exports'
import { Connectors } from '@connectors/constants'
import { getConnectorDisplayName } from '@connectors/pages/connectors/utils/ConnectorUtils'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps,
  ConnectorSelectedValue
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { Scope } from '@common/interfaces/SecretsInterface'
import { ConnectorCardInterface, gitCards } from '@gitsync/common/gitSyncUtils'
import css from './GitSyncRepoForm.module.scss'

interface GitSyncRepoFormProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  isEditMode: boolean
  isNewUser: boolean
  gitSyncRepoInfo?: GitSyncConfig
}

interface ModalConfigureProps {
  onClose?: () => void
  onSuccess?: (data?: GitSyncConfig) => void
}

interface GitSyncFormInterface {
  gitConnectorType: GitSyncConfig['gitConnectorType']
  repo: string
  branch: string
  gitConnector: ConnectorReferenceFieldProps['selected']
}

const GitSyncRepoForm: React.FC<ModalConfigureProps & GitSyncRepoFormProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier } = props
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()

  const { mutate: createGitSyncRepo, loading: creatingGitSync } = usePostGitSync({
    queryParams: { accountIdentifier: accountId }
  })

  const defaultInitialFormData: GitSyncFormInterface = {
    gitConnectorType: Connectors.GITHUB as GitSyncConfig['gitConnectorType'],
    repo: '',
    branch: '',
    gitConnector: undefined
  }

  const [connectorType, setConnectorType] = useState(defaultInitialFormData.gitConnectorType)

  const handleCreate = async (data: GitSyncConfig): Promise<void> => {
    try {
      modalErrorHandler?.hide()
      const response = await createGitSyncRepo(data)
      showSuccess(getString('gitSync.successfullCreate', { name: data.repo }))
      props.onSuccess?.(response)
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.formWrapper} margin="large">
      <Text font={{ size: 'large', weight: 'semi-bold' }} color={Color.GREY_800}>
        {getString('enableGitExperience')}
      </Text>
      <Formik
        initialValues={defaultInitialFormData}
        validationSchema={Yup.object().shape({
          repo: Yup.string().trim().required(getString('validation.repositoryName')),
          branch: Yup.string().trim().required(getString('validation.branchName'))
        })}
        onSubmit={formData => {
          const gitSyncRepoData = {
            ...pick(formData, ['gitConnectorType', 'repo', 'branch']),
            gitConnectorRef: (formData.gitConnector as ConnectorSelectedValue)?.value,
            projectIdentifier: projectIdentifier,
            orgIdentifier: orgIdentifier
          }

          if (props.isEditMode) {
            // handleUpdate(data, formData) Edit of gitSync is not supported now
          } else {
            handleCreate(gitSyncRepoData)
          }
        }}
      >
        {({ values: formValues, setFieldValue }) => (
          <FormikForm>
            <Container className={css.formBody}>
              <Text font={{ size: 'medium', weight: 'semi-bold' }} margin={{ top: 'large', bottom: 'large' }}>
                {getString('selectGitProvider')}
              </Text>

              <ModalErrorHandler bind={setModalErrorHandler} style={{ marginBottom: 'var(--spacing-medium)' }} />
              <Layout.Horizontal margin={{ bottom: 'large' }}>
                {gitCards.map((cardData: ConnectorCardInterface) => {
                  const isSelected = cardData.type === formValues.gitConnectorType
                  return (
                    <Layout.Vertical key={cardData.type} className={css.cardWrapper}>
                      <Card
                        data-testid={`${cardData.type}-card`}
                        onMouseOver={noop}
                        interactive
                        className={cx(css.card, {
                          [css.selectedCard]: isSelected
                        })}
                        onClick={e => {
                          e.stopPropagation()
                          setFieldValue('gitConnectorType', cardData.type)
                          setFieldValue('gitConnector', '')
                          setFieldValue('repo', '')
                          setFieldValue('branch', '')
                          setConnectorType(cardData.type as GitSyncConfig['gitConnectorType'])
                        }}
                      >
                        <Icon
                          margin="large"
                          className={css.connectorTypeIcon}
                          inline={false}
                          name={(isSelected ? cardData.icon?.selected : cardData.icon?.default) as IconName}
                          size={40}
                        />
                      </Card>

                      <Text inline={false} color={isSelected ? Color.BLUE_500 : Color.GREY_500}>
                        {getConnectorDisplayName(cardData.type)}
                      </Text>
                    </Layout.Vertical>
                  )
                })}
              </Layout.Horizontal>

              <ConnectorReferenceField
                name="gitConnector"
                width={350}
                type={connectorType}
                selected={formValues.gitConnector}
                label={getString('selectGitConnectorTypeLabel', { type: getConnectorDisplayName(connectorType) })}
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                onChange={(value, scope) => {
                  setFieldValue('gitConnector', {
                    label: value.name || '',
                    value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
                    scope: scope
                  })
                }}
              />

              <Text font={{ size: 'medium', weight: 'semi-bold' }} margin={{ top: 'large', bottom: 'large' }}>
                {getString('configureHarnessFolder')}
              </Text>
              <FormInput.Text name="repo" label={getString('repositoryUrlLabel')} />
              <FormInput.Text name="branch" label={getString('connectors.git.branchName')} />
            </Container>

            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                className={css.formButton}
                type="submit"
                intent="primary"
                text={getString('save')}
                disabled={creatingGitSync}
              />
              <Button
                className={css.formButton}
                text={getString('cancel')}
                margin={{ left: 'medium' }}
                onClick={props.onClose}
              />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default GitSyncRepoForm
