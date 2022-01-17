/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  Container,
  Formik,
  FormikForm as Form,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  MultiSelectOption,
  FormInput,
  ButtonVariation
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
import UserItemRenderer, { UserItem } from '@audit-trail/components/UserItemRenderer/UserItemRenderer'
import UserTagRenderer from '@audit-trail/components/UserTagRenderer/UserTagRenderer'
import css from '@rbac/modals/UserGroupModal/useUserGroupModal.module.scss'

interface UserGroupModalData {
  data?: UserGroupDTO
  isEdit?: boolean
  isAddMember?: boolean
  onSubmit?: () => void
  onCancel?: () => void
}

interface UserGroupFormDTO extends UserGroupDTO {
  userList?: MultiSelectOption[]
}

const UserGroupForm: React.FC<UserGroupModalData> = props => {
  const { data: userGroupData, onSubmit, isEdit, isAddMember, onCancel } = props
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
                <NameIdDescriptionTags formikProps={formikProps} identifierProps={{ isIdentifierEditable: !isEdit }} />
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
                    tagRenderer: (item: MultiSelectOption) => <UserTagRenderer item={item} />,
                    itemRender: (item, { handleClick }) => <UserItemRenderer item={item} handleClick={handleClick} />
                  }}
                />
              )}
            </Container>
            <Layout.Horizontal spacing="small">
              <Button
                variation={ButtonVariation.PRIMARY}
                text={getString('save')}
                type="submit"
                disabled={saving || updating}
              />
              <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onCancel} />
            </Layout.Horizontal>
          </Form>
        )
      }}
    </Formik>
  )
}

export default UserGroupForm
