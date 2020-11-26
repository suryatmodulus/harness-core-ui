import { AbstractStepFactory } from '@pipeline/exports'
import { HttpStep } from './Steps/HttpStep/HttpStep'
import { K8RolloutDeployStep } from './Steps/K8sRolloutDeployStep/K8sRolloutDeployStep'
import { ShellScriptStep } from './Steps/ShellScriptStep/ShellScriptStep'
import { StepGroupStep } from './Steps/StepGroupStep/StepGroupStep'
import { CustomVariables } from './Steps/CustomVariables/CustomVariables'
import { KubernetesInfraSpec } from './Steps/KubernetesInfraSpec/KubernetesInfraSpec'
import { RunStep } from './Steps/RunStep/RunStep'
import { PluginStep } from './Steps/PluginStep/PluginStep'
import { GCRStep } from './Steps/GCRStep/GCRStep'
import { ECRStep } from './Steps/ECRStep/ECRStep'
import { SaveCacheGCSStep } from './Steps/SaveCacheGCSStep/SaveCacheGCSStep'
import { RestoreCacheGCSStep } from './Steps/RestoreCacheGCSStep/RestoreCacheGCSStep'
import { SaveCacheS3Step } from './Steps/SaveCacheS3Step/SaveCacheS3Step'
import { RestoreCacheS3Step } from './Steps/RestoreCacheS3Step/RestoreCacheS3Step'
import { DockerHubStep } from './Steps/DockerHubStep/DockerHubStep'
import { GCSStep } from './Steps/GCSStep/GCSStep'
import { S3Step } from './Steps/S3Step/S3Step'
import { Dependency } from './Steps/Dependency/Dependency'

class PipelineStepFactory extends AbstractStepFactory {
  protected type = 'pipeline-factory'
}

const factory = new PipelineStepFactory()

// deploy steps
factory.registerStep(new HttpStep())
factory.registerStep(new K8RolloutDeployStep())
factory.registerStep(new ShellScriptStep())
factory.registerStep(new StepGroupStep())
factory.registerStep(new CustomVariables())
factory.registerStep(new KubernetesInfraSpec())
// build steps
factory.registerStep(new RunStep())
factory.registerStep(new PluginStep())
factory.registerStep(new GCRStep())
factory.registerStep(new ECRStep())
factory.registerStep(new SaveCacheGCSStep())
factory.registerStep(new RestoreCacheGCSStep())
factory.registerStep(new SaveCacheS3Step())
factory.registerStep(new RestoreCacheS3Step())
factory.registerStep(new DockerHubStep())
factory.registerStep(new GCSStep())
factory.registerStep(new S3Step())
factory.registerStep(new Dependency())

export default factory
