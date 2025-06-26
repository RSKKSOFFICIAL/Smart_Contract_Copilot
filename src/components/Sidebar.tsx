import React from 'react'
import { 
  Variable, 
  Code, 
  Shield, 
  Zap, 
  Settings, 
  Database,
  Hash,
  Map
} from 'lucide-react'
import { ContractElement } from '../types'

interface SidebarProps {
  onAddElement: (element: Omit<ContractElement, 'id' | 'position'>) => void
}

const Sidebar: React.FC<SidebarProps> = ({ onAddElement }) => {
  const elementTypes = [
    {
      type: 'variable' as const,
      icon: Variable,
      label: 'State Variable',
      description: 'Store data on the blockchain',
      color: 'bg-blue-500'
    },
    {
      type: 'function' as const,
      icon: Code,
      label: 'Function',
      description: 'Execute contract logic',
      color: 'bg-green-500'
    },
    {
      type: 'modifier' as const,
      icon: Shield,
      label: 'Modifier',
      description: 'Add access control',
      color: 'bg-purple-500'
    },
    {
      type: 'event' as const,
      icon: Zap,
      label: 'Event',
      description: 'Emit blockchain events',
      color: 'bg-yellow-500'
    },
    {
      type: 'constructor' as const,
      icon: Settings,
      label: 'Constructor',
      description: 'Initialize contract',
      color: 'bg-red-500'
    },
    {
      type: 'struct' as const,
      icon: Database,
      label: 'Struct',
      description: 'Custom data structure',
      color: 'bg-indigo-500'
    },
    {
      type: 'enum' as const,
      icon: Hash,
      label: 'Enum',
      description: 'Enumerated type',
      color: 'bg-pink-500'
    },
    {
      type: 'mapping' as const,
      icon: Map,
      label: 'Mapping',
      description: 'Key-value storage',
      color: 'bg-teal-500'
    }
  ]

  const handleDragStart = (e: React.DragEvent, elementType: ContractElement['type']) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: elementType }))
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Contract Elements</h2>
        <p className="text-xs lg:text-sm text-gray-600">Drag elements to the canvas to build your smart contract</p>
      </div>

      <div className="flex-1 p-3 lg:p-4 space-y-2 lg:space-y-3 overflow-y-auto">
        {elementTypes.map((element) => {
          const Icon = element.icon
          return (
            <div
              key={element.type}
              draggable
              onDragStart={(e) => handleDragStart(e, element.type)}
              onClick={() => onAddElement({ type: element.type, config: {} })}
              className="group p-3 lg:p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm cursor-move transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-start space-x-2 lg:space-x-3">
                <div className={`w-8 lg:w-10 h-8 lg:h-10 ${element.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs lg:text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {element.label}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {element.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-3 lg:p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 <strong>Tip:</strong> Drag elements to canvas or click to add</p>
          <p>🔧 Click elements on canvas to configure</p>
          <p>🛡️ Use Security Audit for best practices</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
