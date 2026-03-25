import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError, ZodIssue } from 'zod'

export function handlerErros(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof ZodError) {
    const mensagens = error.issues.map((e: ZodIssue) => ({
      campo: e.path.join('.'),
      mensagem: e.message
    }))

    return reply.status(400).send({
      error: 'Dados inválidos',
      detalhes: mensagens
    })
  }

  request.log.error(error)

  return reply.status(500).send({
    error: 'Erro interno do servidor'
  })
}