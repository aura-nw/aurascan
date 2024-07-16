import { v5 as uuidv5 } from 'uuid';

const FEATURE_FLAGS_NAMESPACE = '32bf670d-a39e-46a7-8546-2a11d3c16b33';

export enum FeatureFlags {
  DevTest = uuidv5('devTest', FEATURE_FLAGS_NAMESPACE),
  EnhanceEventLog = uuidv5('enhanceEventLog', FEATURE_FLAGS_NAMESPACE),
  SetTokenInfo = uuidv5('setTokenInfo', FEATURE_FLAGS_NAMESPACE),
}
