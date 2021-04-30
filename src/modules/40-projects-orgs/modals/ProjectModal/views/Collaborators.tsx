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
import { useParams } from 'react-router-dom'
import {
  Project,
  useGetCurrentGenUsers,
  useGetInvites,
  CreateInvite,
  useSendInvite,
  Organization
} from 'services/cd-ng'
import i18n from '@projects-orgs/pages/projects/ProjectsPage.i18n'
import { useStrings } from 'framework/strings'
import { regexEmail } from '@common/utils/StringUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getScopeFromDTO, ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import { useGetRoleList } from 'services/rbac'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { InviteType } from '@rbac/modals/RoleAssignmentModal/views/RoleAssignmentForm'
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
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

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
        label: user.name,
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
                {i18n.newProjectWizard.Collaborators.name}
              </Text>
              <Text padding={{ bottom: 'small' }}>
                {projectIdentifier
                  ? i18n.newProjectWizard.Collaborators.urlMessageProject
                  : i18n.newProjectWizard.Collaborators.urlMessageOrg}
              </Text>
              <Layout.Horizontal>
                <TextInput
                  placeholder={i18n.newProjectWizard.Collaborators.url}
                  disabled
                  rightElement={
                    (
                      <Button
                        tooltip={i18n.newProjectWizard.Collaborators.notAvailableForBeta}
                        icon="duplicate"
                        disabled
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
                  <Text>{i18n.newProjectWizard.Collaborators.inviteCollab}</Text>
                </Layout.Horizontal>
                <Layout.Horizontal
                  width="50%"
                  spacing="xsmall"
                  flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                >
                  <Text>{getString('collaborators.roleLabel')}</Text>
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
                  name={i18n.newProjectWizard.Collaborators.collaborator}
                  items={users}
                  multiSelectProps={{
                    allowCreatingNewItems: true,
                    onQueryChange: (query: string) => {
                      setSearch(query)
                    },
                    // eslint-disable-next-line react/display-name
                    tagRenderer: item => (
                      <Layout.Horizontal key={item.label.toString()} spacing="small">
                        <Avatar email={item.value.toString()} size="xsmall" hoverCard={false} />
                        <Text color={isEmail(item.value.toString().toLowerCase()) ? Color.BLACK : Color.RED_500}>
                          {item.label}
                        </Text>
                      </Layout.Horizontal>
                    ),
                    // eslint-disable-next-line react/display-name
                    itemRender: (item, { handleClick }) => (
                      <div key={item.label.toString()}>
                        <Menu.Item
                          text={
                            <Layout.Horizontal spacing="small" className={css.align}>
                              <Avatar email={item.value.toString()} size="small" hoverCard={false} />
                              <Text>{item.label}</Text>
                            </Layout.Horizontal>
                          }
                          onClick={handleClick}
                        />
                      </div>
                    )
                  }}
                  className={css.input}
                />
                <Button
                  text={i18n.newProjectWizard.Collaborators.add}
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
                    {i18n.newProjectWizard.Collaborators.pendingUsers(inviteData?.data?.content?.length.toString())}
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

            {showManage ? (
              <Layout.Horizontal>
                <Button minimal disabled tooltip={i18n.newProjectWizard.Collaborators.notAvailableForBeta}>
                  {projectIdentifier
                    ? i18n.newProjectWizard.Collaborators.manage
                    : i18n.newProjectWizard.Collaborators.manageOrg}
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
  return (
    <Layout.Vertical padding="xxxlarge">
      <Collaborators
        projectIdentifier={prevStepData?.identifier}
        orgIdentifier={prevStepData?.orgIdentifier}
        showManage={false}
        {...rest}
      />
      <Layout.Horizontal spacing="small">
        <Button onClick={() => previousStep?.(prevStepData)} text={i18n.newProjectWizard.back} />
        <Button
          intent="primary"
          text={i18n.newProjectWizard.saveAndContinue}
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
  return (
    <Layout.Vertical padding="xxxlarge">
      <Collaborators orgIdentifier={prevStepData?.identifier} showManage={false} {...rest} />
      {prevStepData ? (
        <Layout.Horizontal spacing="small">
          <Button onClick={() => previousStep?.(prevStepData)} text={i18n.newProjectWizard.back} />
          <Button
            intent="primary"
            text={i18n.newProjectWizard.finish}
            onClick={() => {
              /* istanbul ignore else */ if (prevStepData) {
                nextStep?.({ ...prevStepData })
              }
            }}
          />
        </Layout.Horizontal>
      ) : (
        <Layout.Horizontal>
          <Button inline minimal disabled tooltip={i18n.newProjectWizard.Collaborators.notAvailableForBeta}>
            {i18n.newProjectWizard.Collaborators.manage}
          </Button>
        </Layout.Horizontal>
      )}
    </Layout.Vertical>
  )
}

export default Collaborators
