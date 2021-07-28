import { ManifestInputForm } from '@cd/components/ManifestInputForm/ManifestInputForm'
import TriggerFactory from '@pipeline/factories/ArtifactTriggerInputFactory'

TriggerFactory.registerDefaultTriggerFormDetails({
  component: ManifestInputForm
})

export default TriggerFactory
