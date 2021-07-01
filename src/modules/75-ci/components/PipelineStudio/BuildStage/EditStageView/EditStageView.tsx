import React from 'react'
import {
  Text,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Collapse,
  Button,
  Switch,
  Icon,
  TextInput,
  RUNTIME_INPUT_VALUE
} from '@wings-software/uicore'
import * as Yup from 'yup'
import type { IconName } from '@blueprintjs/core'
import { isEmpty, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikErrors } from 'formik'
import { produce } from 'immer'
import type { StageElementWrapper, PipelineInfoConfig } from 'services/cd-ng'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { IdentifierSchemaWithoutHook, NameSchemaWithoutHook } from '@common/utils/Validation'
import { Scope } from '@common/interfaces/SecretsInterface'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useGitScope } from '@ci/services/CIUtils'
import css from './EditStageView.module.scss'

export interface EditStageView {
  data?: StageElementWrapper
  onSubmit?: (values: StageElementWrapper, identifier: string, pipeline?: PipelineInfoConfig) => void
  onChange?: (values: StageElementWrapper) => void
}

interface Values {
  identifier: string
  name: string
  description?: string
  cloneCodebase?: boolean
  connectorRef?: ConnectorReferenceFieldProps['selected']
  repoName?: string
}

export const EditStageView: React.FC<EditStageView> = ({ data, onSubmit, onChange }): JSX.Element => {
  const { getString } = useStrings()
  const [connectionType, setConnectionType] = React.useState('')
  const [connectorUrl, setConnectorUrl] = React.useState('')
  const gitScope = useGitScope()

  const {
    state: { pipeline },
    isReadonly
  } = React.useContext(PipelineContext)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const initialValues: Values = {
    identifier: data?.stage.identifier,
    name: data?.stage.name,
    description: data?.stage.description,
    cloneCodebase: data?.stage.spec?.cloneCodebase ?? true
  }

  const codebase = (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase

  const connectorId = getIdentifierFromValue((codebase?.connectorRef as string) || '')
  const initialScope = getScopeFromValue((codebase?.connectorRef as string) || '')

  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined,
      ...(gitScope?.repo && gitScope.branch
        ? { repoIdentifier: gitScope.repo, branch: gitScope.branch, getDefaultFromOtherRepo: true }
        : {})
    },
    lazy: true,
    debounce: 300
  })

  if (connector?.data?.connector) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    initialValues.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope,
      live: connector?.data?.status?.status === 'SUCCESS',
      connector: connector?.data?.connector
    }
  }

  React.useEffect(() => {
    if (!isEmpty(codebase?.connectorRef)) {
      refetch()
    }
  }, [codebase?.connectorRef])

  const validationSchema = () =>
    Yup.lazy((values: Values): any =>
      Yup.object().shape({
        name: NameSchemaWithoutHook(getString, {
          requiredErrorMsg: getString('fieldRequired', { field: getString('stageNameLabel') })
        }),
        identifier: IdentifierSchemaWithoutHook(getString),
        ...(!codebase &&
          values.cloneCodebase && {
            connectorRef: Yup.mixed().required(getString('fieldRequired', { field: getString('connector') })),
            ...(connectionType === 'Account' && {
              repoName: Yup.string().required(
                getString('fieldRequired', { field: getString('pipelineSteps.build.create.repositoryNameLabel') })
              )
            })
          })
      })
    )

  const handleValidate = (values: Values): FormikErrors<Values> => {
    const errors: { name?: string } = {}
    if (isDuplicateStageId(values.identifier, pipeline?.stages || [])) {
      errors.name = getString('validation.identifierDuplicate')
    }
    if (data) {
      onChange?.(values)
    }
    return errors
  }

  const handleSubmit = (values: Values): void => {
    if (data) {
      // TODO: Add Codebase verification
      let pipelineData: PipelineInfoConfig | undefined = undefined
      if (values.cloneCodebase && values.connectorRef) {
        pipelineData = produce(pipeline, draft => {
          set(draft, 'properties.ci.codebase', {
            connectorRef: typeof values.connectorRef === 'string' ? values.connectorRef : values.connectorRef?.value,
            ...(values.repoName && { repoName: values.repoName }),
            build: RUNTIME_INPUT_VALUE
          })

          // Repo level connectors should not have repoName
          if (connectionType === 'Repo' && (draft as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName) {
            delete (draft as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName
          }
        })
      }
      data.stage.identifier = values.identifier
      data.stage.name = values.name

      if (values.description) data.stage.description = values.description
      if (!data.stage.spec) data.stage.spec = {}
      data.stage.spec.cloneCodebase = values.cloneCodebase
      if (pipelineData) {
        onSubmit?.(data, values.identifier, pipelineData)
      } else {
        onSubmit?.(data, values.identifier)
      }
    }
  }

  const collapseProps = {
    collapsedIcon: 'small-plus' as IconName,
    expandedIcon: 'small-minus' as IconName,
    isOpen: false,
    isRemovable: false,
    className: 'collapse',
    heading: getString('description')
  }

  return (
    <div className={css.stageCreate}>
      <Container padding="medium">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          validate={handleValidate}
          formName="ciEditStage"
          onSubmit={handleSubmit}
        >
          {formikProps => (
            <FormikForm>
              <Text
                font={{ size: 'medium', weight: 'semi-bold' }}
                icon="ci-main"
                iconProps={{ size: 16 }}
                margin={{ bottom: 'medium' }}
              >
                {getString('pipelineSteps.build.create.aboutYourStage')}
              </Text>
              <FormInput.InputWithIdentifier
                inputLabel={getString('stageNameLabel')}
                inputGroupProps={{
                  disabled: isReadonly,
                  placeholder: getString('pipeline.aboutYourStage.stageNamePlaceholder')
                }}
              />
              <div className={css.collapseDiv}>
                <Collapse
                  {...collapseProps}
                  isOpen={(formikProps.values.description && formikProps.values.description?.length > 0) || false}
                >
                  <FormInput.TextArea name="description" disabled={isReadonly} />
                </Collapse>
              </div>
              <Switch
                label={getString('cloneCodebaseLabel')}
                onChange={e => formikProps.setFieldValue('cloneCodebase', e.currentTarget.checked)}
                defaultChecked={formikProps.values.cloneCodebase}
                margin={{ bottom: 'small' }}
                disabled={isReadonly}
              />
              <div className={css.cloneCodebaseInfo}>
                <Icon name="info" size={10} margin={{ right: 'small' }} />
                <Text font="xsmall">{getString('pipelineSteps.build.create.cloneCodebaseHelperText')}</Text>
              </div>
              {/* We don't need to configure CI Codebase if it is already configured or we are skipping Clone Codebase step */}
              {!codebase && formikProps.values.cloneCodebase && (
                <div className={css.configureCodebase}>
                  <Text
                    font={{ size: 'medium', weight: 'semi-bold' }}
                    icon="cog"
                    iconProps={{ size: 18 }}
                    margin={{ bottom: 'medium' }}
                  >
                    {getString('pipelineSteps.build.create.configureCodebase')}
                  </Text>
                  <Text margin={{ bottom: 'medium' }}>
                    {getString('pipelineSteps.build.create.configureCodebaseHelperText')}
                  </Text>
                  <ConnectorReferenceField
                    error={
                      formikProps.submitCount && formikProps.errors.connectorRef
                        ? formikProps.errors.connectorRef
                        : undefined
                    }
                    name="connectorRef"
                    type={['Git', 'Github', 'Gitlab', 'Bitbucket', 'Codecommit']}
                    selected={formikProps.values.connectorRef}
                    label={getString('connector')}
                    placeholder={loading ? getString('loading') : getString('connectors.selectConnector')}
                    disabled={loading || isReadonly}
                    accountIdentifier={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    onChange={(value, scope) => {
                      setConnectionType(value.type === 'Git' ? value.spec.connectionType : value.spec.type)
                      setConnectorUrl(value.spec.url)

                      formikProps.setFieldValue('connectorRef', {
                        label: value.name || '',
                        value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
                        scope: scope,
                        live: value?.status?.status === 'SUCCESS',
                        connector: value
                      })
                    }}
                    gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  />
                  {connectionType === 'Repo' ? (
                    <>
                      <Text margin={{ bottom: 'xsmall' }}>
                        {getString('pipelineSteps.build.create.repositoryNameLabel')}
                      </Text>
                      <TextInput name="repoName" value={connectorUrl} style={{ flexGrow: 1 }} disabled />
                    </>
                  ) : (
                    <>
                      <FormInput.Text
                        className={css.repositoryUrl}
                        label={'Repository Name'}
                        name="repoName"
                        style={{ flexGrow: 1 }}
                        disabled={isReadonly}
                        placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
                      />
                      {connectorUrl.length > 0 ? (
                        <Text className={css.predefinedValue} width={380} lineClamp={1}>
                          {(connectorUrl[connectorUrl.length - 1] === '/' ? connectorUrl : connectorUrl + '/') +
                            (formikProps.values.repoName ? formikProps.values.repoName : '')}
                        </Text>
                      ) : null}
                    </>
                  )}
                </div>
              )}
              <Button
                type="submit"
                intent="primary"
                text={getString('pipelineSteps.build.create.setupStage')}
                margin={{ top: 'small' }}
              />
            </FormikForm>
          )}
        </Formik>
      </Container>
    </div>
  )
}
