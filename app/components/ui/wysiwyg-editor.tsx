import React, { useRef, useEffect } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { cn } from '~/lib/utils'

interface WysiwygEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  rows?: number
}

const WysiwygEditor = React.forwardRef<any, WysiwygEditorProps>(
  ({ value = '', onChange, placeholder, className, disabled = false, rows = 4 }, ref) => {
    const editorRef = useRef<any>(null)

    useEffect(() => {
      if (ref && typeof ref === 'object') {
        ref.current = editorRef.current
      }
    }, [ref])

    const handleEditorChange = (content: string) => {
      if (onChange) {
        onChange(content)
      }
    }

    // Calculate height based on rows (roughly 24px per row + padding)
    const minHeight = Math.max(rows * 24 + 40, 120)

    return (
      <div className={cn('wysiwyg-editor', className)}>
        <Editor
          onInit={(_evt, editor) => {
            editorRef.current = editor
          }}
          value={value}
          onEditorChange={handleEditorChange}
          disabled={disabled}
          init={{
            height: minHeight,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style: `
              body { 
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                font-size: 14px;
                line-height: 1.5;
                margin: 8px;
              }
            `,
            placeholder: placeholder,
            skin: 'oxide',
            content_css: 'default',
            branding: false,
            statusbar: false,
            resize: 'vertical',
            setup: (editor: any) => {
              // Add custom styling to match the app's design
              editor.on('init', () => {
                const container = editor.getContainer()
                if (container) {
                  container.style.border = '1px solid hsl(var(--border))'
                  container.style.borderRadius = '6px'
                  container.style.transition = 'border-color 0.2s'
                }
              })
              
              editor.on('focus', () => {
                const container = editor.getContainer()
                if (container) {
                  container.style.borderColor = 'hsl(var(--ring))'
                  container.style.outline = '2px solid transparent'
                  container.style.outlineOffset = '2px'
                  container.style.boxShadow = '0 0 0 2px hsl(var(--ring))'
                }
              })
              
              editor.on('blur', () => {
                const container = editor.getContainer()
                if (container) {
                  container.style.borderColor = 'hsl(var(--border))'
                  container.style.boxShadow = 'none'
                }
              })
            }
          }}
        />
      </div>
    )
  }
)

WysiwygEditor.displayName = 'WysiwygEditor'

export { WysiwygEditor }