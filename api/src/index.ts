import Fastify from 'fastify'
import dotenv from 'dotenv'
import conexaoBanco from './db/conexao'

dotenv.config()

const app = Fastify({ logger: true })

app.register(conexaoBanco)

const PORT = Number(process.env.PORT) || 3000

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})