import { useEffect, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import { Extension } from "@tiptap/core"
import { TableKit } from "@tiptap/extension-table"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import StatusAlert from "../../../shared/components/StatusAlert"
import ArticleMediaPicker from "./ArticleMediaPicker"
import ArticleStructuredHtml from "../../blog/ArticleStructuredHtml"
import { comparableHtml } from "./articleEditorData"

const PreservedAttributes = Extension.create({
  name: "preservedAttributes",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote", "bulletList", "orderedList", "listItem", "codeBlock"],
        attributes: { id: { default: null } },
      },
      { types: ["image"], attributes: { width: { default: null }, height: { default: null } } },
    ]
  },
})

export default function ArticleBodyEditor({ content, editable, disabled, onChange }) {
  const [mediaOpen, setMediaOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [link, setLink] = useState("")
  const [unsupported, setUnsupported] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5] },
        link: { openOnClick: false, HTMLAttributes: { target: null, rel: null } },
      }),
      Image.configure({ inline: true }),
      PreservedAttributes,
      TableKit,
    ],
    content,
    editable: editable && !disabled,
    editorProps: { attributes: { role: "textbox", "aria-label": "本文", "aria-multiline": "true" } },
    onCreate: ({ editor: instance }) => {
      const lostContent = Boolean(content.trim()) && comparableHtml(content) !== comparableHtml(instance.getHTML())
      setUnsupported(lostContent)
      instance.setEditable(editable && !disabled && !lostContent, false)
    },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  })
  useEffect(() => {
    editor?.setEditable(editable && !disabled && !unsupported, false)
  }, [editor, editable, disabled, unsupported])
  if (!editor) return null
  const locked = !editable || unsupported
  const actions = [
    ["見出し", () => editor.chain().focus().toggleHeading({ level: 2 }).run()],
    ["太字", () => editor.chain().focus().toggleBold().run()],
    ["斜体", () => editor.chain().focus().toggleItalic().run()],
    ["箇条書き", () => editor.chain().focus().toggleBulletList().run()],
    ["番号付きリスト", () => editor.chain().focus().toggleOrderedList().run()],
    ["引用", () => editor.chain().focus().toggleBlockquote().run()],
    ["コード", () => editor.chain().focus().toggleCode().run()],
    ["コードブロック", () => editor.chain().focus().toggleCodeBlock().run()],
    ["元に戻す", () => editor.chain().focus().undo().run()],
    ["やり直す", () => editor.chain().focus().redo().run()],
  ]
  return (
    <Stack spacing={1}>
      {locked ? (
        <StatusAlert severity="warning">
          本文の形式・装飾を安全に保存できるか確認できないため、本文は microCMS
          で編集してください。ほかの項目は保存できます。
        </StatusAlert>
      ) : null}
      {locked ? (
        <ArticleStructuredHtml html={content} />
      ) : (
        <>
          <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.5 }}>
            {actions.map(([label, action]) => (
              <Button key={label} size="small" variant="outlined" disabled={disabled} onClick={action}>
                {label}
              </Button>
            ))}
            <Button
              size="small"
              variant="outlined"
              disabled={disabled}
              onClick={() => {
                setLink(editor.getAttributes("link").href || "")
                setLinkOpen(true)
              }}
            >
              リンク
            </Button>
            <Button size="small" variant="outlined" disabled={disabled} onClick={() => setMediaOpen(true)}>
              画像
            </Button>
          </Stack>
          {linkOpen ? (
            <Stack
              component="form"
              direction="row"
              spacing={1}
              onSubmit={(event) => {
                event.preventDefault()
                if (!link || /^https?:\/\//i.test(link)) {
                  const chain = editor.chain().focus().extendMarkRange("link")
                  if (link) chain.setLink({ href: link }).run()
                  else chain.unsetLink().run()
                  setLinkOpen(false)
                }
              }}
            >
              <Box
                component="input"
                type="url"
                aria-label="リンク先URL"
                value={link}
                onChange={(event) => setLink(event.target.value)}
                sx={{ minWidth: 0, flex: 1 }}
              />
              <Button type="submit">適用</Button>
              <Button onClick={() => setLinkOpen(false)}>取消</Button>
            </Stack>
          ) : null}
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              "& .tiptap": { minHeight: 280, p: 2, outline: "none", overflowWrap: "anywhere" },
              "& img": { maxWidth: "100%" },
              "& pre": { whiteSpace: "pre-wrap" },
            }}
          >
            <EditorContent editor={editor} />
          </Box>
        </>
      )}
      {mediaOpen ? (
        <ArticleMediaPicker
          onClose={() => setMediaOpen(false)}
          onSelect={(item) => {
            editor
              .chain()
              .focus()
              .setImage({ src: item.url, alt: item.alt || "" })
              .run()
            setMediaOpen(false)
          }}
        />
      ) : null}
    </Stack>
  )
}
