import { FastifyInstance } from 'fastify'
import {
  criarPedido,
  listarPedidos,
  detalharPedido,
  atualizarStatus
} from '../handlers/pedidos'

export default async function rotasPedidos(app: FastifyInstance) {
  app.post('/orders', criarPedido)
  app.get('/orders', listarPedidos)
  app.get('/orders/:id', detalharPedido)
  app.patch('/orders/:id/status', atualizarStatus)
}