import { ApiClient } from '@mondaydotcomorg/api'
import { env } from '@/config/env'

const mondayClient = new ApiClient({ token: env.mondayApiKey })

export default mondayClient
