import React, { useRef } from 'react'
import { ContractElement } from '../types'
import ElementNode from './ElementNode'

interface CanvasProps {
  elements: ContractElement[]
  selectedElement: ContractElement | null
  onSelectElement: (element: ContractElement) => void
  onUpdateElement: (id: string, updates: Partial<ContractElement>) => void
  onDeleteElement: (id: string) => void
  onAddElement: (element: Omit<ContractElement, 'id' | 'position'>) => void
}

const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onAddElement
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      const position = {
        x: e.clientX - rect.left - 100, // Center the element
        y: e.clientY - rect.top - 50
      }

      onAddElement({
        type: data.type,
        config: {}
      })
    } catch (error) {
      console.error('Failed to parse drop data:', error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="flex-1 relative bg-gray-50">
      <div
        ref={canvasRef}
        className="w-full h-full relative overflow-auto"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Drop Zone Hint */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Building Your Smart Contract</h3>
              <p className="text-gray-600 max-w-md">
                Drag elements from the sidebar or click them to add to your canvas. 
                Build complex smart contracts with our visual interface.
              </p>
            </div>
          </div>
        )}

        {/* Contract Elements */}
        {elements.map((element) => (
          <ElementNode
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => onSelectElement(element)}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            onDelete={() => onDeleteElement(element.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default Canvas
