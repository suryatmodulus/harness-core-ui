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
  MultiSelectOption,
  FormInput,
  Avatar
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import { Menu } from '@blueprintjs/core'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import { NameIdDescriptionTags, useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { UserGroupDTO, usePostUserGroup, useGetCurrentGenUsers, usePutUserGroup } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from '@rbac/modals/UserGroupModal/useUserGroupModal.module.scss'

interface UserGroupModalData {
  data?: UserGroupDTO
  isEdit?: boolean
  isAddMember?: boolean
  onSubmit?: () => void
}

interface UserGroupFormDTO extends UserGroupDTO {
  userList?: MultiSelectOption[]
}

const UserGroupForm: React.FC<UserGroupModalData> = props => {
  const { data: userGroupData, onSubmit, isEdit, isAddMember } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [search, setSearch] = useState<string>()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: createUserGroup, loading: saving } = usePostUserGroup({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { mutate: editUserGroup, loading: updating } = usePutUserGroup({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { data: userList } = useGetCurrentGenUsers({
    queryParams: {
      accountIdentifier: accountId,
      searchString: search
    }
  })

  const getTitle = (): string => {
    if (isEdit) return getString('rbac.userGroupPage.editUserGroup')
    if (isAddMember) return getString('rbac.userGroupPage.addMembers')
    return getString('rbac.userGroupPage.newUserGroup')
  }

  const users: MultiSelectOption[] =
    userList?.data?.content?.map(value => {
      return {
        label: value.name,
        value: value.uuid
      }
    }) || []

  const handleEdit = async (values: UserGroupFormDTO): Promise<void> => {
    const userDetails = values.userList?.map((user: MultiSelectOption) => user.value as string)
    delete values.userList
    const dataToSubmit: UserGroupDTO = values
    if (userDetails) dataToSubmit['users']?.push(...userDetails)
    try {
      const edited = await editUserGroup(dataToSubmit)
      /* istanbul ignore else */ if (edited) {
        showSuccess(
          isEdit
            ? getString('rbac.userGroupForm.editSuccess', { name: edited.data?.name })
            : getString('rbac.userGroupForm.addMemberSuccess')
        )

        onSubmit?.()
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  const handleCreate = async (values: UserGroupFormDTO): Promise<void> => {
    const dataToSubmit: UserGroupDTO = pick(values, ['name', 'identifier', 'description', 'tags'])
    dataToSubmit['users'] = values.userList?.map((user: MultiSelectOption) => user.value as string)
    try {
      const created = await createUserGroup(dataToSubmit)
      /* istanbul ignore else */ if (created) {
        showSuccess(getString('rbac.userGroupForm.createSuccess', { name: created.data?.name }))
        onSubmit?.()
      }
    } catch (e) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }
  return (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {getTitle()}
        </Text>
        <Formik<UserGroupFormDTO>
          initialValues={{
            identifier: '',
            name: '',
            description: '',
            tags: {},
            ...userGroupData
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required(),
            identifier: Yup.string().when('name', {
              is: val => val?.length,
              then: Yup.string().required().matches(regexIdentifier).notOneOf(illegalIdentifiers)
            })
          })}
          onSubmit={values => {
            if (isEdit || isAddMember) handleEdit(values)
            else handleCreate(values)
          }}
        >
          {formikProps => {
            return (
              <Form>
                <Container className={css.form}>
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  {isAddMember ? null : (
                    <NameIdDescriptionTags
                      formikProps={formikProps}
                      identifierProps={{ isIdentifierEditable: !isEdit }}
                    />
                  )}
                  {isEdit ? null : (
                    <FormInput.MultiSelect
                      name="userList"
                      label={getString('rbac.userGroupPage.addUsers')}
                      items={users}
                      multiSelectProps={{
                        allowCreatingNewItems: false,
                        onQueryChange: (query: string) => {
                          setSearch(query)
                        },
                        // eslint-disable-next-line react/display-name
                        tagRenderer: item => (
                          <Layout.Horizontal key={item.label.toString()} spacing="small">
                            <Avatar name={item.label} size="xsmall" hoverCard={false} />
                            <Text>{item.label}</Text>
                          </Layout.Horizontal>
                        ),
                        // eslint-disable-next-line react/display-name
                        itemRender: (item, { handleClick }) => (
                          <div key={item.label.toString()}>
                            <Menu.Item
                              text={
                                <Layout.Horizontal spacing="small">
                                  <Avatar name={item.label} size="small" hoverCard={false} />
                                  <Text>{item.label}</Text>
                                </Layout.Horizontal>
                              }
                              onClick={handleClick}
                            />
                          </div>
                        )
                      }}
                    />
                  )}
                </Container>
                <Layout.Horizontal>
                  <Button intent="primary" text={getString('save')} type="submit" disabled={saving || updating} />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default UserGroupForm
