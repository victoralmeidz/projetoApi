import Fastify from 'fastify'
import dotenv from 'dotenv'

dotenv.config()

const app = Fastify({ logger: true })

const PORT = Number(process.env.PORT) || 3000

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})