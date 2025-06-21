import React, { useState } from 'react'
import { 
  Variable, 
  Code, 
  Shield, 
  Zap, 
  Settings, 
  Database,
  Hash,
  Map,
  Edit3,
  Trash2,
  Check,
  X
} from 'lucide-react'
import { ContractElement } from '../types'

interface ElementNodeProps {
  element: ContractElement
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<ContractElement>) => void
  onDelete: () => void
}

const ElementNode: React.FC<ElementNodeProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editConfig, setEditConfig] = useState(element.config)

  const iconMap = {
    variable: Variable,
    function: Code,
    modifier: Shield,
    event: Zap,
    constructor: Settings,
    struct: Database,
    enum: Hash,
    mapping: Map
  }

  const colorMap = {
    variable: 'bg-blue-500',
    function: 'bg-green-500',
    modifier: 'bg-purple-500',
    event: 'bg-yellow-500',
    constructor: 'bg-red-500',
    struct: 'bg-indigo-500',
    enum: 'bg-pink-500',
    mapping: 'bg-teal-500'
  }

  const Icon = iconMap[element.type]

  const handleSave = () => {
    onUpdate({ config: editConfig })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditConfig(element.config)
    setIsEditing(false)
  }

  return (
    <div
      className={`absolute bg-white rounded-lg shadow-lg border-2 transition-all duration-200 ${
        isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-200 hover:border-gray-300'
      }`}
      style={{
        left: element.position.x,
        top: element.position.y,
        minWidth: '280px'
      }}
      onClick={onSelect}
    >
      {/* Header */}
      <div className={`${colorMap[element.type]} text-white p-3 rounded-t-lg flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5" />
          <span className="font-medium capitalize">{element.type}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={editConfig.name || ''}
                onChange={(e) => setEditConfig({ ...editConfig, name: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Enter ${element.type} name`}
              />
            </div>

            {element.type === 'variable' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Data Type</label>
                  <select
                    value={editConfig.dataType || 'uint256'}
                    onChange={(e) => setEditConfig({ ...editConfig, dataType: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="uint256">uint256</option>
                    <option value="string">string</option>
                    <option value="bool">bool</option>
                    <option value="address">address</option>
                    <option value="bytes32">bytes32</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Visibility</label>
                  <select
                    value={editConfig.visibility || 'public'}
                    onChange={(e) => setEditConfig({ ...editConfig, visibility: e.target.value as any })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">public</option>
                    <option value="private">private</option>
                    <option value="internal">internal</option>
                  </select>
                </div>
              </>
            )}

            {element.type === 'function' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Parameters</label>
                  <input
                    type="text"
                    value={editConfig.parameters || ''}
                    onChange={(e) => setEditConfig({ ...editConfig, parameters: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="uint256 _value, address _to"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Returns</label>
                  <input
                    type="text"
                    value={editConfig.returns || ''}
                    onChange={(e) => setEditConfig({ ...editConfig, returns: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="bool success"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Visibility</label>
                  <select
                    value={editConfig.visibility || 'public'}
                    onChange={(e) => setEditConfig({ ...editConfig, visibility: e.target.value as any })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">public</option>
                    <option value="external">external</option>
                    <option value="internal">internal</option>
                    <option value="private">private</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editConfig.payable || false}
                      onChange={(e) => setEditConfig({ ...editConfig, payable: e.target.checked })}
                      className="mr-1"
                    />
                    <span className="text-xs">payable</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editConfig.view || false}
                      onChange={(e) => setEditConfig({ ...editConfig, view: e.target.checked })}
                      className="mr-1"
                    />
                    <span className="text-xs">view</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editConfig.pure || false}
                      onChange={(e) => setEditConfig({ ...editConfig, pure: e.target.checked })}
                      className="mr-1"
                    />
                    <span className="text-xs">pure</span>
                  </label>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="font-medium text-gray-900">
              {element.config.name || `Unnamed ${element.type}`}
            </div>
            {element.config.dataType && (
              <div className="text-sm text-gray-600">
                Type: <span className="font-mono">{element.config.dataType}</span>
              </div>
            )}
            {element.config.visibility && (
              <div className="text-sm text-gray-600">
                Visibility: <span className="font-mono">{element.config.visibility}</span>
              </div>
            )}
            {element.config.parameters && (
              <div className="text-sm text-gray-600">
                Parameters: <span className="font-mono text-xs">{element.config.parameters}</span>
              </div>
            )}
            {element.config.returns && (
              <div className="text-sm text-gray-600">
                Returns: <span className="font-mono text-xs">{element.config.returns}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {element.config.payable && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">payable</span>
              )}
              {element.config.view && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">view</span>
              )}
              {element.config.pure && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">pure</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ElementNode
