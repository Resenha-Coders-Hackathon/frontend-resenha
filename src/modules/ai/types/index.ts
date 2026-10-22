export interface AiAnswer {
  answer: string
}

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}
