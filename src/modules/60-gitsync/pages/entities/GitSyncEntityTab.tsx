import React, { useState } from 'react'
import {
  Container,
  Color,
  Collapse,
  IconName,
  Text,
  Layout,
  FormInput,
  Formik,
  FormikForm,
  SelectOption
} from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { noop } from 'lodash-es'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { GitSyncConfig } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import EntitiesPreview from './EntitiesPreview'
import { Products } from './EntityHelper'
import css from './GitSyncEntityTab.module.scss'

const GitSyncEntityTab: React.FC = () => {
  const { gitSyncRepos } = useGitSyncStore()
  const { getString } = useStrings()
  const [selectedBranch, setSelectedBranch] = useState('')
  selectedBranch

  const collapseProps = {
    collapsedIcon: 'main-chevron-right' as IconName,
    expandedIcon: 'main-chevron-down' as IconName,
    iconProps: { size: 16 } as IconProps,
    isOpen: false,
    isRemovable: false,
    className: 'collapse',
    collapseHeaderClassName: css.collapseHeader
  }

  const getCollapseHeading = (gitRepo: GitSyncConfig): JSX.Element => {
    const branchSelectOptions = [
      {
        label: gitRepo.branch || '',
        value: gitRepo.branch || '',
        icon: { name: 'git-clone-step' } as IconProps
      }
    ]

    return (
      <Layout.Horizontal flex className={css.header}>
        <Text font={{ size: 'medium', weight: 'semi-bold' }} margin={{ left: 'small' }} color={Color.BLUE_600} inline>
          {gitRepo.name}
        </Text>

        <Formik
          initialValues={{
            branch: gitRepo.branch
          }}
          onSubmit={noop}
        >
          <FormikForm>
            <FormInput.Select
              name="branch"
              items={branchSelectOptions}
              disabled={true}
              onChange={(branch: SelectOption, event) => {
                setSelectedBranch(branch.value as string)
                event?.preventDefault()
                event?.stopPropagation()
              }}
            />
          </FormikForm>
        </Formik>
      </Layout.Horizontal>
    )
  }

  return (
    <Container className={css.bodyContainer}>
      <Text color={Color.GREY_600} font={{ weight: 'semi-bold', size: 'medium' }} margin="large">
        {getString('gitsync.entitiesByRepositories')}
      </Text>

      {gitSyncRepos?.map((gitRepo: GitSyncConfig, index: number) => {
        // Todo: once BE maintains unique identifier, it can be used as key
        return (
          <Container className={css.collapseFeatures} key={(gitRepo?.identifier || '') + index}>
            <Collapse {...collapseProps} heading={getCollapseHeading(gitRepo)}>
              <EntitiesPreview selectedProduct={Products.CI} repo={gitRepo} />
            </Collapse>
          </Container>
        )
      })}
    </Container>
  )
}

export default GitSyncEntityTab
