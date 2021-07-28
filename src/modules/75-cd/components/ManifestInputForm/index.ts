import { ManifestInputForm } from '@cd/components/ManifestInputForm/ManifestInputForm'
import factory from '@pipeline/factories/ArtifactTriggerInputFactory'

factory.registerDefaultStepDetails({
  component: ManifestInputForm
})

export default factory
