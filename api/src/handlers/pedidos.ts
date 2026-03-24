import { FastifyRequest, FastifyReply } from 'fastify'
import { criarPedidoSchema, atualizarStatusSchema } from '../schemas'
import { CriarPedidoBody, AtualizarStatusBody } from '../tipos'

export async function criarPedido(
  request: FastifyRequest<{ Body: CriarPedidoBody }>,
  reply: FastifyReply
) {
  const dados = criarPedidoSchema.parse(request.body)

  const total = dados.items.reduce((soma, item) => {
    return soma + item.quantity * item.unit_price
  }, 0)

  const { rows } = await request.server.pg.query(
    `INSERT INTO pedidos (customer_name, items, total)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [dados.customer_name, JSON.stringify(dados.items), total]
  )

  return reply.status(201).send(rows[0])
}

export async function listarPedidos(
  request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>,
  reply: FastifyReply
) {
  const page = Number(request.query.page) || 1
  const limit = Number(request.query.limit) || 10
  const offset = (page - 1) * limit

  const { rows } = await request.server.pg.query(
    `SELECT * FROM pedidos ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  )

  return reply.send(rows)
}

export async function detalharPedido(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { rows } = await request.server.pg.query(
    `SELECT * FROM pedidos WHERE id = $1`,
    [request.params.id]
  )

  if (rows.length === 0) {
    return reply.status(404).send({ error: 'Pedido não encontrado' })
  }

  return reply.send(rows[0])
}

export async function atualizarStatus(
  request: FastifyRequest<{ Params: { id: string }; Body: AtualizarStatusBody }>,
  reply: FastifyReply
) {
  const dados = atualizarStatusSchema.parse(request.body)

  const { rows: pedidoAtual } = await request.server.pg.query(
    `SELECT status FROM pedidos WHERE id = $1`,
    [request.params.id]
  )

  if (pedidoAtual.length === 0) {
    return reply.status(404).send({ error: 'Pedido não encontrado' })
  }

  if (pedidoAtual[0].status === 'confirmed' && dados.status === 'cancelled') {
    return reply.status(409).send({ error: 'Não é possível cancelar um pedido já confirmado' })
  }

  const { rows } = await request.server.pg.query(
    `UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *`,
    [dados.status, request.params.id]
  )

  return reply.send(rows[0])
}

