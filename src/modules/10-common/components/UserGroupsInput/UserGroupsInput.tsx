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
import type { ScopeAndIdentifier } from '../MultiSelectEntityReference/MultiSelectEntityReference'
import css from './UserGroupsInput.module.scss'

export interface UserGroupsInputProps {
  name: string
  label?: string
  placeholder?: string
  onSuccess?: (userGroups: string[]) => void
  userGroupsMockData?: UserGroupDTO
}
interface MappedUserGroupData {
  name: Scope
  userGroupsCount: number
}

interface FormikUserGroupsInput extends UserGroupsInputProps {
  formik: FormikContext<any>
}
const getScopeAndUserIdIdentifierFromString = (record: string): ScopeAndIdentifier => {
  const indexOfDot = record.indexOf('.')
  let scope = Scope.PROJECT
  let identifier = record
  if (indexOfDot !== -1) {
    const scopeTemp = record.slice(0, indexOfDot).toLowerCase()
    const uuidTemp = record.slice(indexOfDot + 1)
    switch (scopeTemp) {
      case Scope.ACCOUNT:
        scope = Scope.ACCOUNT
        identifier = uuidTemp
        break
      case Scope.ORG:
        scope = Scope.ORG
        identifier = uuidTemp
        break
    }
  }

  return { scope, identifier }
}
const convertListOfScopeObjToStringArry = (records: ScopeAndIdentifier[]): string[] => {
  return records.map(el => {
    let scope = ''

    switch (el.scope) {
      case Scope.ACCOUNT:
        scope = `${Scope.ACCOUNT}.`
        break
      case Scope.ORG:
        scope = `${Scope.ORG}.`
        break
    }
    return `${scope}${el.identifier}`
  })
}

const UserGroupsInput: React.FC<FormikUserGroupsInput> = props => {
  const { getString } = useStrings()
  const { formik, label, name, onSuccess, placeholder } = props
  const userGroupsReference: string[] = formik.values[name]

  const { openSelectUserGroupsModal } = useSelectUserGroupsModal({
    onSuccess: data => {
      const scopeObjToStringArry = convertListOfScopeObjToStringArry(data)
      formik.setFieldValue(name, scopeObjToStringArry)
      setUserGroupsScopeAndIndentifier(data)
      onSuccess?.(scopeObjToStringArry)
    }
  })

  const errorCheck = (): boolean =>
    ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
      get(formik?.errors, name) &&
      !isPlainObject(get(formik?.errors, name))) as boolean

  const [userGroupsScopeAndIndentifier, setUserGroupsScopeAndIndentifier] = useState<ScopeAndIdentifier[]>()

  useEffect(() => {
    if (userGroupsReference && userGroupsReference.length) {
      setUserGroupsScopeAndIndentifier(
        userGroupsReference.map(el => {
          return getScopeAndUserIdIdentifierFromString(el)
          //return { scope: getDefaultScope(el.orgIdentifier, el.projectIdentifier), uuid: el.identifier }
        })
      )
    }
  }, [userGroupsReference])

  const [mappedUserGroups, setMappedUserGroups] = useState<MappedUserGroupData[]>()
  useEffect(() => {
    if (userGroupsScopeAndIndentifier && userGroupsScopeAndIndentifier.length > 0) {
      let accCount = 0
      let projectCount = 0
      let orgCount = 0
      userGroupsScopeAndIndentifier.forEach(ele => {
        switch (ele.scope) {
          case Scope.ORG:
            orgCount++
            break
          case Scope.ACCOUNT:
            accCount++
            break
          case Scope.PROJECT:
            projectCount++
            break
        }
      })

      const tempMappedUserGroups = []
      if (accCount || orgCount || projectCount) {
        if (projectCount) {
          tempMappedUserGroups.push({ name: Scope.PROJECT, userGroupsCount: projectCount })
        }
        if (orgCount) {
          tempMappedUserGroups.push({ name: Scope.ORG, userGroupsCount: orgCount })
        }
        if (accCount) {
          tempMappedUserGroups.push({ name: Scope.ACCOUNT, userGroupsCount: accCount })
        }
      }
      setMappedUserGroups(tempMappedUserGroups)
    }
  }, [userGroupsScopeAndIndentifier])

  return (
    <FormGroup
      helperText={errorCheck() ? get(formik?.errors, name) : null}
      intent={errorCheck() ? Intent.DANGER : Intent.NONE}
    >
      <Layout.Vertical>
        {label ? <label className={'bp3-label'}>{label}</label> : null}
        <Container border padding="xsmall">
          {mappedUserGroups?.length ? (
            <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              {mappedUserGroups.map(scope => {
                return (
                  <Container
                    padding={{ top: 'xsmall', right: 'small', bottom: 'xsmall', left: 'small' }}
                    width={'33%'}
                    background={Color.PRIMARY_2}
                    key={scope.name}
                    onClick={() => {
                      openSelectUserGroupsModal(userGroupsScopeAndIndentifier, scope.name)
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
                        background={Color.PRIMARY_7}
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
