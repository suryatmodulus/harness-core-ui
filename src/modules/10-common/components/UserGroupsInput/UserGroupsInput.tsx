import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { connect, FormikContext } from 'formik'
import { Layout, Container, Text, Color } from '@wings-software/uicore'

import { get, isPlainObject } from 'lodash-es'
import { FormGroup, Intent } from '@blueprintjs/core'
import type { UserGroupDTO } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import useSelectUserGroupsModal from '@common/modals/SelectUserGroups/useSelectUserGroupsModal'
import { useStrings } from 'framework/strings'
import { ScopeAndUuid, getDefaultScope } from '@common/components/EntityReference/EntityReference'
import css from './UserGroupsInput.module.scss'

export interface UserGroupsInputProps {
  name: string
  label?: string
  placeholder?: string
  onSuccess?: (userGroups: UserGroupDTO[]) => void
  userGroupsMockData?: UserGroupDTO
}

interface FormikUserGroupsInput extends UserGroupsInputProps {
  formik: FormikContext<any>
}

const UserGroupsInput: React.FC<FormikUserGroupsInput> = props => {
  const { getString } = useStrings()
  const { formik, label, name, onSuccess, placeholder } = props
  const userGroupsReference: UserGroupDTO[] = formik.values[name]

  const { openSelectUserGroupsModal } = useSelectUserGroupsModal({
    onSuccess: data => {
      formik.setFieldValue(name, data)
      onSuccess?.(data)
    }
  })

  const errorCheck = (): boolean =>
    ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
      get(formik?.errors, name) &&
      !isPlainObject(get(formik?.errors, name))) as boolean

  const [userGroupsScopeAndUuid, setUserGroupsScopeAndUuid] = useState<ScopeAndUuid[]>()

  useEffect(() => {
    if (userGroupsReference) {
      setUserGroupsScopeAndUuid(
        userGroupsReference.map(el => {
          return { scope: getDefaultScope(el.orgIdentifier, el.projectIdentifier), uuid: el.identifier }
        })
      )
    }
  }, [userGroupsReference])

  let mappedUserGroups: { name: Scope; userGroupsCount: number }[] | undefined = undefined
  let inputItems = null
  if (userGroupsReference && userGroupsReference.length > 0) {
    let accCount = 0
    let projectCount = 0
    let orgCount = 0
    userGroupsReference.forEach(group => {
      group.orgIdentifier && !group.projectIdentifier && orgCount++
      group.projectIdentifier && group.orgIdentifier && projectCount++
      group.accountIdentifier && !group.projectIdentifier && !group.orgIdentifier && accCount++
    })
    if (accCount || orgCount || projectCount) {
      mappedUserGroups = []
      if (projectCount) {
        mappedUserGroups.push({ name: Scope.PROJECT, userGroupsCount: projectCount })
      }
      if (orgCount) {
        mappedUserGroups.push({ name: Scope.ORG, userGroupsCount: orgCount })
      }
      if (accCount) {
        mappedUserGroups.push({ name: Scope.ACCOUNT, userGroupsCount: accCount })
      }
    }

    inputItems = mappedUserGroups?.length ? (
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        {mappedUserGroups.map(scope => {
          return (
            <Container
              padding={{ top: 'xsmall', right: 'small', bottom: 'xsmall', left: 'small' }}
              width={'30%'}
              background={Color.PRIMARY_2}
              key={scope.name}
              onClick={() => {
                openSelectUserGroupsModal(userGroupsScopeAndUuid, scope.name)
              }}
              border={{ radius: 100 }}
              className={css.pointer}
            >
              <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text font={{ size: 'small' }} color={Color.BLACK}>
                  {scope.name.toUpperCase()}
                </Text>
                <Text
                  font={{ size: 'small' }}
                  padding={{ left: 'xsmall', right: 'xsmall' }}
                  flex={{ align: 'center-center' }}
                  background={Color.BLUE_600}
                  color={Color.WHITE}
                  border={{ radius: 100 }}
                >
                  {scope.userGroupsCount}
                </Text>
              </Layout.Horizontal>
            </Container>
          )
        })}
      </Layout.Horizontal>
    ) : null
  }

  return (
    <FormGroup
      helperText={errorCheck() ? get(formik?.errors, name) : null}
      intent={errorCheck() ? Intent.DANGER : Intent.NONE}
    >
      <Layout.Vertical>
        {label ? <label className={'bp3-label'}>{label}</label> : null}
        <Container border padding="xsmall">
          {inputItems ? (
            inputItems
          ) : (
            <Link
              to="#"
              className={css.link}
              data-testid={name}
              onClick={e => {
                e.preventDefault()
                openSelectUserGroupsModal()
              }}
            >
              <Text
                color={Color.BLUE_500}
                flex={{ alignItems: 'center', justifyContent: 'flex-start', inline: false }}
                padding="xsmall"
              >
                {placeholder || getString('select')}
              </Text>
            </Link>
          )}
        </Container>
      </Layout.Vertical>
    </FormGroup>
  )
}

export default connect<Omit<FormikUserGroupsInput, 'formik'>>(UserGroupsInput)
