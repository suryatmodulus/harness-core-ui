import React from 'react'
import { Text, Layout, Color, Button } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import css from '@projects-orgs/components/ProjectSelector/ProjectSelector.module.scss'

interface CreateOrSelectAProjectTemplateProps {
  onCreateProject: () => void
  closeModal?: () => void
  moduleDescription: string
}

export const CreateOrSelectAProjectTemplate: React.FC<CreateOrSelectAProjectTemplateProps> = ({
  onCreateProject,
  moduleDescription,
  closeModal
}) => {
  const { getString } = useStrings()
  function toggleSelectProject(): void {
    const selectProjectButton: HTMLElement = document.getElementsByClassName(css.selectButton)[0] as HTMLElement

    selectProjectButton?.click()
    closeModal?.()
  }

  function handleCreateProject(): void {
    closeModal?.()
    onCreateProject()
  }

  return (
    <Layout.Vertical spacing="small">
      <Text style={{ color: Color.BLACK, fontSize: 'large', fontWeight: 'bold' }}>
        {getString('projectsOrgs.createOrSelectAProject')}
      </Text>
      <Text style={{ color: Color.BLACK, fontSize: 'small' }}>
        {getString('projectsOrgs.getStarted', { moduleDescription })}
      </Text>
      <Layout.Horizontal spacing="small" padding={{ top: 'large' }}>
        <Button
          intent="primary"
          text={getString('projectsOrgs.selectAnExistingProject')}
          onClick={toggleSelectProject}
        />
        <Button intent="none" text={getString('projectsOrgs.createANewProject')} onClick={handleCreateProject} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
