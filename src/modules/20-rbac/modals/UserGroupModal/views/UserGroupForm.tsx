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
import { useStrings } from 'framework/exports'
import { UserGroupDTO, usePostUserGroup, useGetUsers } from 'services/cd-ng'
import css from '@rbac/modals/UserGroupModal/useUserGroupModal.module.scss'

interface RoleModalData {
  data?: UserGroupDTO
  isEdit?: boolean
  onSubmit?: () => void
}

const UserGroupForm: React.FC<RoleModalData> = props => {
  const { data: userGroupData, onSubmit, isEdit } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
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

  const { data: userList } = useGetUsers({
    queryParams: {
      accountIdentifier: accountId,
      searchString: search
    }
  })

  const users: MultiSelectOption[] =
    userList?.data?.content?.map(value => {
      return {
        label: value.name,
        value: value.uuid
      }
    }) || []

  const handleSubmit = async (values: any): Promise<void> => {
    const dataToSubmit: UserGroupDTO = pick(values, ['name', 'identifier', 'description', 'tags'])
    dataToSubmit['users'] = values.userList?.map((user: MultiSelectOption) => user.value)
    try {
      const created = await createUserGroup(dataToSubmit)
      /* istanbul ignore else */ if (created) {
        showSuccess(getString('roleForm.createSuccess'))
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
          {getString('rbac.userGroupPage.newUserGroup')}
        </Text>
        <Formik
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
            handleSubmit(values)
          }}
        >
          {formikProps => {
            return (
              <Form>
                <Container className={css.form}>
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <NameIdDescriptionTags
                    formikProps={formikProps}
                    identifierProps={{ isIdentifierEditable: !isEdit }}
                  />
                  <FormInput.MultiSelect
                    name="userList"
                    label={getString('rbac.addUser')}
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
                </Container>
                <Layout.Horizontal>
                  <Button intent="primary" text={getString('save')} type="submit" disabled={saving} />
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
