import { ArtifactInputForm } from '@cd/components/ArtifactInputForm/ArtifactInputForm'
import TriggerFactory from '@pipeline/factories/ArtifactTriggerInputFactory'

TriggerFactory.registerDefaultTriggerFormDetails({
  component: ArtifactInputForm
})

export default TriggerFactory
