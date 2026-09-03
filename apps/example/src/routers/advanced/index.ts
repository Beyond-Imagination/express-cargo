import type { Router } from 'express'
import inheritanceRouter from './inheritance'
import polymorphismRouter from './polymorphism'
import integrationRouter from './integration'
import passportRouter from './passport'

const advancedRouters: Router[] = [inheritanceRouter, polymorphismRouter, integrationRouter, passportRouter]

export default advancedRouters
