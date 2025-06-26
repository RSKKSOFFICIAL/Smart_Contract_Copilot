import React, { useState, useRef, useEffect } from 'react'
import { Copy, Download, Eye, Edit3, Save, X } from 'lucide-react'

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editableCode, setEditableCode] = useState(code)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditableCode(code)
  }, [code])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    // Show temporary feedback
    const button = document.activeElement as HTMLButtonElement
    if (button) {
      const originalText = button.textContent
      button.textContent = 'Copied!'
      setTimeout(() => {
        button.textContent = originalText
      }, 1000)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contract.sol'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  const handleSave = () => {
    onChange(editableCode)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditableCode(code)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = editableCode.substring(0, start) + '  ' + editableCode.substring(end)
      setEditableCode(newValue)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
    
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          {isEditing ? <Edit3 className="w-5 h-5 text-blue-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
          <h3 className="text-base lg:text-lg font-semibold text-white">
            {isEditing ? 'Editing Contract' : 'Generated Contract'}
          </h3>
        </div>
        <div className="flex items-center space-x-1 lg:space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-green-400 hover:text-green-300 hover:bg-gray-800 rounded-lg transition-colors text-sm"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-lg transition-colors text-sm"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </button>
              <button
                onClick={downloadCode}
                className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {code || isEditing ? (
          <div className="h-full relative">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-full p-3 lg:p-4 text-sm text-gray-300 font-mono leading-relaxed bg-gray-900 border-none outline-none resize-none"
                placeholder="Enter your Solidity code here..."
                spellCheck={false}
              />
            ) : (
              <div className="h-full overflow-auto">
                <pre className="p-3 lg:p-4 text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                  <code>{code}</code>
                </pre>
              </div>
            )}
            
            {/* Line numbers overlay for editing mode */}
            {isEditing && (
              <div className="absolute top-0 left-0 p-3 lg:p-4 text-sm text-gray-500 font-mono leading-relaxed pointer-events-none select-none">
                {editableCode.split('\n').map((_, index) => (
                  <div key={index} className="text-right w-8">
                    {index + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 lg:p-8">
              <div className="w-12 lg:w-16 h-12 lg:h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-xl lg:text-2xl">📝</span>
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-white mb-2">No Contract Generated</h3>
              <p className="text-gray-400 max-w-md text-sm lg:text-base">
                Add some elements to your canvas and click "Generate Contract" to see the Solidity code here.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {isEditing && (
        <div className="p-2 lg:p-3 border-t border-gray-700 bg-gray-800">
          <p className="text-xs text-gray-400">
            💡 Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Tab</kbd> for indentation, 
            <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs ml-1">Ctrl+S</kbd> to save
          </p>
        </div>
      )}
    </div>
  )
}

export default CodeEditor
