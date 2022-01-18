/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  FormInput,
  Layout,
  Button,
  ButtonVariation,
  Container,
  Formik,
  ModalErrorHandlerBinding,
  FormikForm as Form,
  useToaster,
  ModalErrorHandler
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import {
  useGetOrganizationAggregateDTOList,
  useGetProjectListWithMultiOrgFilter,
  useCopyUserGroup
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { CopyGroupFormType } from './CopyMenuItem'
import { useStrings } from 'framework/strings'
import css from './CopyMenuItem.module.scss'
import { getOrgList, getProjectList, getScopeList } from '@rbac/utils/utils'

interface CopyGroupFormProps {
  handleFormClose: () => void
}

const CopyGroupForm: React.FC<CopyGroupFormProps> = ({ handleFormClose }) => {
  const [orgQuery, setOrgQuery] = useState('')
  const [projectsQuery, setProjectsQuery] = useState('')
  const { accountId } = useParams<ProjectPathProps>()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { getString } = useStrings()

  const { data } = useGetOrganizationAggregateDTOList({
    queryParams: {
      pageIndex: 0,
      searchTerm: orgQuery,
      accountIdentifier: accountId
    }
  })

  const { data: projectData, refetch: refetchProjectList } = useGetProjectListWithMultiOrgFilter({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm: projectsQuery,
      orgIdentifiers: []
    },
    lazy: true,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    debounce: 300
  })

  const { mutate: copyUserGroup } = useCopyUserGroup({ queryParams: { accountIdentifier: accountId } })
  const { showSuccess } = useToaster()

  const orgList = data?.data?.content ? getOrgList(data?.data?.content) : []
  const projects = projectData?.data?.content ? getProjectList(projectData?.data?.content) : []

  const onSave = async (values: CopyGroupFormType) => {
    modalErrorHandler?.hide()
    const { organizations: selectedOrgs, projects: selectedProjects } = values
    const scopeList = getScopeList(selectedOrgs, selectedProjects, accountId)
    try {
      const response = await copyUserGroup(scopeList)
      if (response) {
        showSuccess(getString('rbac.copyGroupSuccess'))
      }
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  return (
    <>
      <Formik<CopyGroupFormType>
        initialValues={{
          organizations: [],
          projects: []
        }}
        formName="copyGroupForm"
        onSubmit={values => {
          onSave(values)
        }}
      >
        {formik => {
          const selectedOrgs = formik.values.organizations

          return (
            <Form>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <Container className={css.copyGroupForm}>
                <FormInput.MultiSelect
                  name="organizations"
                  label={getString('orgLabel')}
                  items={orgList}
                  multiSelectProps={{
                    allowCreatingNewItems: false,
                    onQueryChange: (query: string) => {
                      setOrgQuery(query)
                    }
                  }}
                  onChange={org => {
                    refetchProjectList({
                      queryParams: {
                        accountIdentifier: accountId,
                        orgIdentifiers: org.map(o => o.value as string),
                        pageIndex: 0
                      }
                    })
                  }}
                />
                <FormInput.MultiSelect
                  label={getString('projectLabel')}
                  name="projects"
                  items={projects}
                  disabled={selectedOrgs.length === 0}
                  multiSelectProps={{
                    allowCreatingNewItems: false,
                    onQueryChange: (query: string) => {
                      setProjectsQuery(query)
                    }
                  }}
                />
              </Container>
              <Layout.Horizontal spacing="small">
                <Button
                  disabled={selectedOrgs.length === 0}
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('save')}
                />
                <Button variation={ButtonVariation.TERTIARY} onClick={handleFormClose} text={getString('cancel')} />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </>
  )
}

export default CopyGroupForm
