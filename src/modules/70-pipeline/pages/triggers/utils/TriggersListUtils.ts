import type { IconName } from '@wings-software/uicore'
// temporary mock data
import type { AddDrawerMapInterface } from '@common/components/AddDrawer/AddDrawer'
import type { GetActionsListQueryParams } from 'services/pipeline-ng'
import type { StringKeys } from 'framework/exports'
import { TriggerTypes } from './TriggersWizardPageUtils'

export const GitSourceProviders: Record<
  GetActionsListQueryParams['sourceRepo'],
  { value: GetActionsListQueryParams['sourceRepo']; iconName: IconName }
> = {
  GITHUB: { value: 'GITHUB', iconName: 'github' },
  GITLAB: { value: 'GITLAB', iconName: 'service-gotlab' },
  BITBUCKET: { value: 'BITBUCKET', iconName: 'bitbucket' },
  AWS_CODECOMMIT: { value: 'AWS_CODECOMMIT', iconName: 'service-aws-code-deploy' },
  CUSTOM: { value: 'CUSTOM', iconName: 'build' }
}

const TriggerTypeIcons = {
  SCHEDULE: 'trigger-schedule'
}
export const getTriggerIcon = ({
  type,
  webhookSourceRepo
}: {
  type: string
  webhookSourceRepo: GetActionsListQueryParams['sourceRepo'] | undefined | string // string temporary until backend
}): IconName => {
  const webhookSourceRepoIconName =
    webhookSourceRepo && GitSourceProviders[webhookSourceRepo as GetActionsListQueryParams['sourceRepo']]?.iconName
  if (type === TriggerTypes.WEBHOOK && webhookSourceRepoIconName) {
    return webhookSourceRepoIconName as IconName
  } else if (type === TriggerTypes.SCHEDULE) {
    return TriggerTypeIcons.SCHEDULE as IconName
  }
  // placeholder for now
  return GitSourceProviders.GITHUB?.iconName as IconName
}

const triggerDrawerMap = (getString: (key: StringKeys) => string): AddDrawerMapInterface => ({
  drawerLabel: getString('pipeline-triggers.triggersLabel'),
  drawerSubLabel: getString('pipeline-triggers.triggersSubLabel'),
  showAllLabel: getString('pipeline-triggers.showAllTriggers'),
  searchPlaceholder: getString('pipeline-triggers.searchPlaceholder'),
  categories: [
    // {
    //   categoryLabel: getString('pipeline-triggers.onNewArtifactTitle'),
    //   categoryValue: 'OnArtifact',
    //   items: [
    //     {
    //       itemLabel: getString('pipeline-triggers.newArtifactLabel'),
    //       value: 'NewArtifact',
    //       iconName: 'trigger-artifact' as IconName
    //     },
    //     {
    //       itemLabel: getString('pipeline-triggers.newManifestLabel'),
    //       value: 'NewManifest',
    //       iconName: 'trigger-artifact' as IconName
    //     }
    //   ]
    // },
    {
      categoryLabel: getString('pipeline-triggers.scheduledLabel'),
      categoryValue: 'Scheduled',
      items: [
        {
          itemLabel: getString('pipeline-triggers.cronLabel'),
          value: 'Cron',
          iconName: TriggerTypeIcons.SCHEDULE as IconName
        }
      ]
    },
    {
      categoryLabel: getString('execution.triggerType.WEBHOOK'),
      categoryValue: 'Webhook',
      items: [
        {
          itemLabel: getString('common.repo_provider.githubLabel'),
          value: GitSourceProviders.GITHUB.value,
          iconName: GitSourceProviders.GITHUB.iconName
        },
        {
          itemLabel: getString('common.repo_provider.gitlabLabel'),
          value: GitSourceProviders.GITLAB.value,
          iconName: GitSourceProviders.GITLAB.iconName
        },
        {
          itemLabel: getString('common.repo_provider.bitbucketLabel'),
          value: GitSourceProviders.BITBUCKET.value,
          iconName: GitSourceProviders.BITBUCKET.iconName
        },
        {
          itemLabel: getString('common.repo_provider.codecommit'),
          value: GitSourceProviders.AWS_CODECOMMIT.value,
          iconName: GitSourceProviders.AWS_CODECOMMIT.iconName
        },
        {
          itemLabel: getString('common.repo_provider.customLabel'),
          value: GitSourceProviders.CUSTOM.value,
          iconName: GitSourceProviders.CUSTOM.iconName
        }
      ]
    }
  ]
})

export const getSourceRepoOptions = (getString: (str: StringKeys) => string): { label: string; value: string }[] => [
  { label: getString('common.repo_provider.githubLabel'), value: GitSourceProviders.GITHUB.value },
  { label: getString('common.repo_provider.gitlabLabel'), value: GitSourceProviders.GITLAB.value },
  { label: getString('common.repo_provider.bitbucketLabel'), value: GitSourceProviders.BITBUCKET.value },
  { label: getString('common.repo_provider.codecommit'), value: GitSourceProviders.AWS_CODECOMMIT.value },
  { label: getString('common.repo_provider.customLabel'), value: GitSourceProviders.CUSTOM.value }
]

export const getCategoryItems = (getString: (key: StringKeys) => string): AddDrawerMapInterface =>
  triggerDrawerMap(getString)

export interface ItemInterface {
  itemLabel: string
  iconName: IconName
  value: string
  visible?: boolean
  disabled?: boolean
  categoryValue?: string
}

export interface TriggerDataInterface {
  triggerType: string
  sourceRepo?: string
  // all else optional
}
