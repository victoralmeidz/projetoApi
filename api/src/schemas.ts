import { z } from 'zod'

export const itemSchema = z.object({
  product: z.string().min(1, 'Produto é obrigatório'),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  unit_price: z.number().positive('Preço deve ser positivo')
})

export const criarPedidoSchema = z.object({
  customer_name: z.string().min(1, 'Nome do cliente é obrigatório'),
  items: z.array(itemSchema).min(1, 'Pedido deve ter ao menos um item')
})

export const atualizarStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled'])
})