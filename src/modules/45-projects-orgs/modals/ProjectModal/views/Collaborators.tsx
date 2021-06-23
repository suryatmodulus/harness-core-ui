import React, { useState } from 'react'
import {
  Formik,
  FormikForm as Form,
  FormInput,
  Button,
  Text,
  Layout,
  StepProps,
  Container,
  Color,
  SelectOption,
  TextInput,
  MultiSelectOption,
  Icon,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  Avatar
} from '@wings-software/uicore'
import { Select } from '@blueprintjs/select'
import cx from 'classnames'
import * as Yup from 'yup'
import { Menu } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import copy from 'copy-to-clipboard'
import {
  Project,
  useGetCurrentGenUsers,
  useGetInvites,
  CreateInvite,
  useSendInvite,
  Organization
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { regexEmail } from '@common/utils/StringUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getScopeFromDTO, ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import { useGetRoleList } from 'services/rbac'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { InviteType } from '@rbac/modals/RoleAssignmentModal/views/RoleAssignmentForm'
import { useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { UserItemRenderer } from '@rbac/utils/utils'
import InviteListRenderer from './InviteListRenderer'
import css from './Steps.module.scss'

interface CollaboratorModalData {
  projectIdentifier?: string
  orgIdentifier?: string
  showManage?: boolean
  defaultRole?: SelectOption
}

interface RoleOption extends SelectOption {
  managed: boolean
}
interface CollaboratorsData {
  collaborators: MultiSelectOption[]
}

const CustomSelect = Select.ofType<SelectOption>()

const Collaborators: React.FC<CollaboratorModalData> = props => {
  const { projectIdentifier, orgIdentifier, showManage = true } = props
  const { NG_RBAC_ENABLED } = useFeatureFlags()
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const history = useHistory()
  const [search, setSearch] = useState<string>()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const initialValues: CollaboratorsData = { collaborators: [] }
  const { data: userData } = useGetCurrentGenUsers({
    queryParams: { accountIdentifier: accountId, searchString: search === '' ? undefined : search },
    debounce: 300
  })

  const { data: inviteData, loading: inviteLoading, refetch: reloadInvites } = useGetInvites({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const { mutate: sendInvite, loading } = useSendInvite({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const { data: roleData } = useGetRoleList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier || '',
      projectIdentifier: projectIdentifier
    }
  })

  const users: SelectOption[] =
    userData?.data?.content?.map(user => {
      return {
        label: user.name || user.email,
        value: user.email
      }
    }) || []

  const getDefaultRole = (scope: ScopedObjectDTO): RoleOption => {
    if (getScopeFromDTO(scope) === Scope.PROJECT)
      return { label: getString('common.projectViewer'), value: '_project_viewer', managed: true }
    if (getScopeFromDTO(scope) === Scope.ORG)
      return {
        label: getString('common.orgViewer'),
        value: '_organization_viewer',
        managed: true
      }
    return { label: getString('common.accViewer'), value: '_account_viewer', managed: true }
  }

  const [role, setRole] = useState<RoleOption>(
    getDefaultRole({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
  )

  const roles: RoleOption[] =
    roleData?.data?.content?.map(roleOption => {
      return {
        label: roleOption.role.name,
        value: roleOption.role.identifier,
        managed: roleOption.harnessManaged || false
      }
    }) || []

  const isEmail = (email: string): boolean => {
    return regexEmail.test(String(email).toLowerCase())
  }

  const getUrl = (): string | undefined => {
    if (projectIdentifier && orgIdentifier)
      return `${window.location.href.split('#')[0]}#${routes.toProjectDetails({
        accountId,
        orgIdentifier,
        projectIdentifier
      })}`
    if (orgIdentifier)
      return `${window.location.href.split('#')[0]}#${routes.toOrganizationDetails({ accountId, orgIdentifier })}`
  }

  const SendInvitation = async (values: MultiSelectOption[]): Promise<void> => {
    const usersToSubmit = values?.map(collaborator => {
      return collaborator.value
    })

    const dataToSubmit: CreateInvite = {
      users: usersToSubmit as string[],
      roleBindings: [
        {
          roleIdentifier: role.value.toString(),
          roleName: role.label,
          managedRole: role.managed
        }
      ],
      inviteType: InviteType.ADMIN_INITIATED
    }

    try {
      await sendInvite(dataToSubmit)
      reloadInvites()
    } catch (e) {
      modalErrorHandler?.show(e.data)
    }
  }

  return (
    <Formik<CollaboratorsData>
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        collaborators: Yup.array().of(
          Yup.object().shape({
            value: Yup.string().email().required()
          })
        )
      })}
      formName="collaboratorsForm"
      onSubmit={(values, { resetForm }) => {
        modalErrorHandler?.hide()
        SendInvitation(values.collaborators)
        setRole(getDefaultRole({ accountIdentifier: accountId, orgIdentifier, projectIdentifier }))
        resetForm({ collaborators: [] })
      }}
      enableReinitialize={true}
    >
      {formik => {
        return (
          <Form>
            <ModalErrorHandler bind={setModalErrorHandler} />
            <Container className={css.collaboratorForm}>
              <Text font="medium" color={Color.BLACK} padding={{ bottom: 'xxlarge' }}>
                {getString('projectsOrgs.invite')}
              </Text>
              <Text padding={{ bottom: 'small' }}>
                {projectIdentifier
                  ? getString('projectsOrgs.urlMessageProject')
                  : getString('projectsOrgs.urlMessageOrg')}
              </Text>
              <Layout.Horizontal>
                <TextInput
                  placeholder={getUrl()}
                  disabled
                  rightElement={
                    (
                      <Button
                        icon="duplicate"
                        onClick={() => {
                          copy(getUrl() || '')
                            ? showSuccess(getString('clipboardCopySuccess'))
                            : showError(getString('clipboardCopyFail'))
                        }}
                        inline
                        minimal
                        className={css.clone}
                      />
                    ) as any
                  }
                  className={css.url}
                />
              </Layout.Horizontal>
              <Layout.Horizontal padding={{ top: 'medium' }} spacing="xlarge" className={cx(css.align, css.input)}>
                <Layout.Horizontal width="50%">
                  <Text>{getString('projectsOrgs.inviteCollab')}</Text>
                </Layout.Horizontal>
                <Layout.Horizontal
                  width="50%"
                  spacing="xsmall"
                  flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                >
                  <Text>{getString('projectsOrgs.roleLabel')}</Text>
                  <CustomSelect
                    items={roles}
                    filterable={false}
                    itemRenderer={(item, { handleClick }) => (
                      <div key={item.label}>
                        <Menu.Item
                          text={item.label}
                          onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => handleClick(e)}
                        />
                      </div>
                    )}
                    onItemSelect={item => {
                      setRole(item as RoleOption)
                    }}
                    popoverProps={{ minimal: true, popoverClassName: css.customselect }}
                  >
                    <Button
                      inline
                      minimal
                      intent="primary"
                      rightIcon="chevron-down"
                      className={cx(css.toEnd, css.roleButton)}
                    >
                      <Text lineClamp={1}>{role.label}</Text>
                    </Button>
                  </CustomSelect>
                </Layout.Horizontal>
              </Layout.Horizontal>
              <Layout.Horizontal spacing="small">
                <FormInput.MultiSelect
                  name={getString('projectsOrgs.collaborator')}
                  items={users}
                  multiSelectProps={{
                    allowCreatingNewItems: true,
                    onQueryChange: (query: string) => {
                      setSearch(query)
                    },
                    // eslint-disable-next-line react/display-name
                    tagRenderer: item => (
                      <Layout.Horizontal key={item.label.toString()} flex spacing="small">
                        <Avatar name={item.label} email={item.value.toString()} size="xsmall" hoverCard={false} />
                        <Text color={isEmail(item.value.toString().toLowerCase()) ? Color.BLACK : Color.RED_500}>
                          {item.label}
                        </Text>
                      </Layout.Horizontal>
                    ),
                    itemRender: UserItemRenderer
                  }}
                  className={css.input}
                />
                <Button
                  text={getString('add')}
                  intent="primary"
                  inline
                  disabled={role.value === 'none' || formik.values.collaborators.length === 0 ? true : false}
                  type="submit"
                  loading={loading}
                />
              </Layout.Horizontal>
              {inviteData?.data?.content?.length ? (
                <Layout.Vertical padding={{ top: 'medium', bottom: 'xxxlarge' }}>
                  <Text padding={{ bottom: 'small' }}>
                    {getString('projectsOrgs.pendingUsers', { name: inviteData?.data?.content?.length.toString() })}
                  </Text>
                  <Container className={css.pendingList}>
                    {inviteData?.data?.content.slice(0, 15).map(user => (
                      <InviteListRenderer key={user.name} user={user} reload={reloadInvites} roles={roles} />
                    ))}
                  </Container>
                </Layout.Vertical>
              ) : inviteLoading ? (
                <Layout.Vertical padding={{ top: 'xxxlarge', bottom: 'xxxlarge' }}>
                  <Icon name="steps-spinner" size={32} color={Color.GREY_600} flex={{ align: 'center-center' }} />
                </Layout.Vertical>
              ) : null}
            </Container>

            {showManage && NG_RBAC_ENABLED ? (
              <Layout.Horizontal>
                <Button
                  minimal
                  className={css.manageUsers}
                  onClick={() => {
                    history.push(routes.toUsers({ accountId, orgIdentifier, projectIdentifier }))
                  }}
                >
                  {projectIdentifier ? getString('projectsOrgs.manageProject') : getString('projectsOrgs.manageOrg')}
                </Button>
              </Layout.Horizontal>
            ) : null}
          </Form>
        )
      }}
    </Formik>
  )
}

export const ProjectCollaboratorsStep: React.FC<StepProps<Project> & CollaboratorModalData> = ({
  prevStepData,
  previousStep,
  nextStep,
  ...rest
}) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical padding="xxxlarge">
      <Collaborators
        projectIdentifier={prevStepData?.identifier}
        orgIdentifier={prevStepData?.orgIdentifier}
        showManage={false}
        {...rest}
      />
      <Layout.Horizontal spacing="small">
        <Button onClick={() => previousStep?.(prevStepData)} text={getString('back')} />
        <Button
          intent="primary"
          text={getString('saveAndContinue')}
          onClick={() => {
            /* istanbul ignore else */ if (prevStepData) {
              nextStep?.({ ...prevStepData })
            }
          }}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const OrgCollaboratorsStep: React.FC<StepProps<Organization> & CollaboratorModalData> = ({
  prevStepData,
  previousStep,
  nextStep,
  ...rest
}) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical padding="xxxlarge">
      <Collaborators orgIdentifier={prevStepData?.identifier} showManage={false} {...rest} />
      {prevStepData ? (
        <Layout.Horizontal spacing="small">
          <Button onClick={() => previousStep?.(prevStepData)} text={getString('back')} />
          <Button
            intent="primary"
            text={getString('finish')}
            onClick={() => {
              /* istanbul ignore else */ if (prevStepData) {
                nextStep?.({ ...prevStepData })
              }
            }}
          />
        </Layout.Horizontal>
      ) : (
        <Layout.Horizontal>
          <Button inline minimal disabled tooltip={getString('projectsOrgs.notAvailableForBeta')}>
            {getString('projectsOrgs.manageProject')}
          </Button>
        </Layout.Horizontal>
      )}
    </Layout.Vertical>
  )
}

export default Collaborators
