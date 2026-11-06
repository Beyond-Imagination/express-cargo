import { nested25Scenario } from './nested25'
import { validScenario } from './valid'
import { validationFailureScenario } from './validationFailure'

export { nested25Scenario, validScenario, validationFailureScenario }

export const benchmarkCases = [validScenario, validationFailureScenario, nested25Scenario] as const
