export interface Item {
  product: string
  quantity: number
  unit_price: number
}

export interface Pedido {
  id: string
  customer_name: string
  items: Item[]
  status: 'pending' | 'confirmed' | 'cancelled'
  total: number
  created_at: Date
}

export interface CriarPedidoBody {
  customer_name: string
  items: Item[]
}

export interface AtualizarStatusBody {
  status: 'pending' | 'confirmed' | 'cancelled'
}