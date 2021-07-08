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
  FormInput
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { pick, cloneDeep } from 'lodash-es'
import { NameIdDescriptionTags, useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { UserGroupDTO, usePostUserGroup, usePutUserGroup, useGetUsers } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useMutateAsGet } from '@common/hooks'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { UserItem, UserItemRenderer, UserTagRenderer } from '@rbac/utils/utils'
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

  const { data: userList } = useMutateAsGet(useGetUsers, {
    body: { searchTerm: search },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const getTitle = (): string => {
    if (isEdit) return getString('rbac.userGroupPage.editUserGroup')
    if (isAddMember) return getString('rbac.userGroupPage.addMembers')
    return getString('rbac.userGroupPage.newUserGroup')
  }

  const users: UserItem[] =
    userList?.data?.content?.map(value => {
      return {
        label: value.name || '',
        value: value.uuid,
        email: value.email
      }
    }) || []

  const handleEdit = async (formData: UserGroupFormDTO): Promise<void> => {
    const values = cloneDeep(formData)
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
          formName="userGroupForm"
          validationSchema={Yup.object().shape({
            name: NameSchema(),
            identifier: IdentifierSchema()
          })}
          onSubmit={values => {
            modalErrorHandler?.hide()
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
                      className={css.input}
                      multiSelectProps={{
                        allowCreatingNewItems: false,
                        onQueryChange: (query: string) => {
                          setSearch(query)
                        },
                        tagRenderer: UserTagRenderer,
                        itemRender: UserItemRenderer
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
