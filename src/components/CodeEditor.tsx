import React from 'react'
import { Copy, Download, Eye } from 'lucide-react'

interface CodeEditorProps {
  code: string
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
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

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Generated Contract</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span className="text-sm">Copy</span>
          </button>
          <button
            onClick={downloadCode}
            className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Download</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {code ? (
          <pre className="p-4 text-sm text-gray-300 font-mono leading-relaxed">
            <code>{code}</code>
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Contract Generated</h3>
              <p className="text-gray-400 max-w-md">
                Add some elements to your canvas and click "Generate Contract" to see the Solidity code here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeEditor
