export interface ContractElement {
  id: string
  type: 'variable' | 'function' | 'modifier' | 'event' | 'constructor' | 'struct' | 'enum' | 'mapping'
  position: { x: number; y: number }
  config: {
    name?: string
    dataType?: string
    visibility?: 'public' | 'private' | 'internal' | 'external'
    parameters?: string
    returns?: string
    payable?: boolean
    view?: boolean
    pure?: boolean
    virtual?: boolean
    override?: boolean
    description?: string
  }
}

export interface AuditIssue {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  line?: number
  suggestion?: string
}

export interface GasOptimization {
  id: string
  type: 'storage' | 'computation' | 'memory' | 'external-calls'
  description: string
  estimatedSavings: number
  suggestion: string
}
