import type { IconName } from '@wings-software/uicore'
// temporary mock data
import { parse } from 'yaml'
import type { AddDrawerMapInterface } from '@common/components/AddDrawer/AddDrawer'
import type { StringKeys } from 'framework/strings'
import { manifestTypeIcons } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { TriggerTypes, AWS_CODECOMMIT, AwsCodeCommit } from './TriggersWizardPageUtils'

export const GitSourceProviders: Record<string, { value: string; iconName: IconName }> = {
  GITHUB: { value: 'Github', iconName: 'github' },
  GITLAB: { value: 'Gitlab', iconName: 'service-gotlab' },
  BITBUCKET: { value: 'Bitbucket', iconName: 'bitbucket-selected' },
  AWS_CODECOMMIT: { value: 'AwsCodeCommit', iconName: 'service-aws-code-deploy' },
  CUSTOM: { value: 'Custom', iconName: 'build' }
}

const TriggerTypeIcons = {
  SCHEDULE: 'trigger-schedule',
  NEW_ARTIFACT: 'new-artifact'
}
export const getTriggerIcon = ({
  type,
  webhookSourceRepo,
  artifactManifestType
}: {
  type: string
  webhookSourceRepo?: string // string temporary until backend
  artifactManifestType?: string
}): IconName => {
  const updatedWebhookSourceRepo =
    webhookSourceRepo === AwsCodeCommit ? AWS_CODECOMMIT : webhookSourceRepo?.toUpperCase()
  const webhookSourceRepoIconName =
    webhookSourceRepo && updatedWebhookSourceRepo && GitSourceProviders[updatedWebhookSourceRepo]?.iconName
  if (type === TriggerTypes.WEBHOOK && webhookSourceRepoIconName) {
    return webhookSourceRepoIconName as IconName
  } else if (type === TriggerTypes.SCHEDULE) {
    return TriggerTypeIcons.SCHEDULE as IconName
  } else if (type === TriggerTypes.MANIFEST && artifactManifestType) {
    if (artifactManifestType === 'HelmChart') {
      return manifestTypeIcons.HelmChart
    }
  }
  return 'yaml-builder-trigger'
}

const triggerDrawerMap = (getString: (key: StringKeys) => string): AddDrawerMapInterface => ({
  drawerLabel: getString('pipeline.triggers.triggersLabel'),
  drawerSubLabel: getString('pipeline.triggers.triggersSubLabel'),
  showAllLabel: getString('pipeline.triggers.showAllTriggers'),
  searchPlaceholder: getString('pipeline.triggers.searchPlaceholder'),

  categories: [
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
          itemLabel: getString('common.repo_provider.awscodecommit'),
          value: GitSourceProviders.AWS_CODECOMMIT.value,
          iconName: GitSourceProviders.AWS_CODECOMMIT.iconName
        },
        {
          itemLabel: getString('common.repo_provider.customLabel'),
          value: GitSourceProviders.CUSTOM.value,
          iconName: GitSourceProviders.CUSTOM.iconName
        }
      ]
    },
    {
      categoryLabel: getString('pipeline.triggers.scheduledLabel'),
      categoryValue: 'Scheduled',
      items: [
        {
          itemLabel: getString('pipeline.triggers.cronLabel'),
          value: 'Cron',
          iconName: TriggerTypeIcons.SCHEDULE as IconName
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
  manifestType?: string
  artifactType?: string
}

export const getEnabledStatusTriggerValues = ({
  data,
  enabled,
  getString
}: {
  data: any
  enabled: boolean
  getString: (key: StringKeys) => string
}): { values?: any; error?: string } => {
  try {
    const triggerResponseJson = parse(data?.yaml || '')
    triggerResponseJson.trigger.enabled = enabled
    return { values: triggerResponseJson.trigger }
  } catch (e) {
    return { error: getString('pipeline.triggers.cannotParseTriggersData') }
  }
}
