/** Card details go directly to Mercado Pago; only its one-time token reaches our API. */
export interface CardDetails {
  number: string
  holder: string
  expiry: string
  cvv: string
  cpf: string
}

interface MercadoPagoClient {
  createCardToken(data: {
    cardNumber: string
    cardholderName: string
    cardExpirationMonth: string
    cardExpirationYear: string
    securityCode: string
    identificationType: 'CPF'
    identificationNumber: string
  }): Promise<{ id: string }>
  getPaymentMethods(data: { bin: string }): Promise<{
    results: { id: string; payment_type_id: string; issuer?: { id: number } }[]
  }>
}

declare global {
  interface Window {
    MercadoPago?: new (key: string, options: { locale: 'pt-BR' }) => MercadoPagoClient
  }
}

let loading: Promise<void> | undefined
function loadSdk(): Promise<void> {
  if (window.MercadoPago) return Promise.resolve()
  if (loading) return loading
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.async = true
    const fail = () => {
      window.clearTimeout(timer)
      script.remove()
      reject(new Error('Não foi possível carregar o Mercado Pago. Tente novamente.'))
    }
    const timer = window.setTimeout(fail, 15000)
    script.onerror = fail
    script.onload = () => {
      window.clearTimeout(timer)
      if (window.MercadoPago) resolve()
      else fail()
    }
    document.head.append(script)
  }).catch((error: unknown) => {
    loading = undefined
    throw error
  })
  return loading
}

export async function tokenizeCard(details: CardDetails): Promise<{
  token: string
  payment_method_id: string
  issuer_id?: number
}> {
  const key = import.meta.env.VITE_MP_PUBLIC_KEY
  if (!key) throw new Error('O pagamento por cartão não está configurado.')
  await loadSdk()
  if (!window.MercadoPago) throw new Error('O Mercado Pago não foi carregado.')
  const client = new window.MercadoPago(key, { locale: 'pt-BR' })
  const number = details.number.replace(/\D/g, '')
  const [month = '', year = ''] = details.expiry.split('/')
  try {
    const methods = await client.getPaymentMethods({ bin: number.slice(0, 8) })
    const method = methods.results.find((item) => item.payment_type_id === 'credit_card')
    if (!method) throw new Error('Cartão de crédito não aceito.')
    const token = await client.createCardToken({
      cardNumber: number,
      cardholderName: details.holder,
      cardExpirationMonth: month,
      cardExpirationYear: year.length === 2 ? `20${year}` : year,
      securityCode: details.cvv,
      identificationType: 'CPF',
      identificationNumber: details.cpf.replace(/\D/g, ''),
    })
    if (!token.id) throw new Error('Não foi possível validar o cartão.')
    return { token: token.id, payment_method_id: method.id, issuer_id: method.issuer?.id }
  } catch {
    // Provider failures can contain sensitive card data. Never render or log that object.
    throw new Error('Não foi possível validar o cartão. Confira os dados e tente novamente.')
  }
}
