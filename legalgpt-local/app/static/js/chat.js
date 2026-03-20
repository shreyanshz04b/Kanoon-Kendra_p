const chatForm = document.getElementById("chatForm")
const chatBox = document.getElementById("chatBox")
const chatStatus = document.getElementById("chatStatus")
const uploadTrigger = document.getElementById("uploadTrigger")
const chatFileInput = document.getElementById("chatFileInput")
const docsList = document.getElementById("docsList")
const refreshDocs = document.getElementById("refreshDocs")

function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function addLine(who, text) {
  const div = document.createElement("div")
  const isUser = who === "You"
  div.className = `mb-3 flex ${isUser ? "justify-end" : "justify-start"}`
  const safeText = escapeHTML(text).replaceAll("\n", "<br>")
  div.innerHTML = `
    <div class="max-w-[85%] rounded-xl px-3 py-2 border ${isUser ? "bg-[#172235] text-[#f7f2e8] border-[#172235]" : "bg-white/85 text-slate-900 border-slate-200"}">
      <p class="text-[11px] opacity-75 mb-1 uppercase tracking-wide">${who}</p>
      <p class="text-sm leading-relaxed">${safeText}</p>
    </div>
  `
  chatBox.appendChild(div)
  chatBox.scrollTop = chatBox.scrollHeight
}

function setStatus(message, isError = false) {
  if (!chatStatus) return
  chatStatus.textContent = message
  chatStatus.className = isError
    ? "mt-2 text-xs text-red-600"
    : "mt-2 text-xs text-slate-500"
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "-"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function loadDocuments() {
  if (!docsList) return
  const res = await fetch("/api/documents")
  const data = await res.json()
  if (!data.ok) {
    docsList.innerHTML = '<p class="text-xs text-red-600">Failed to load documents.</p>'
    return
  }

  if (!data.documents.length) {
    docsList.innerHTML = '<p class="text-xs text-slate-500">No documents uploaded yet.</p>'
    return
  }

  docsList.innerHTML = data.documents
    .map((doc) => {
      const statusClass =
        doc.status === "indexed"
          ? "text-emerald-700"
          : doc.status === "rejected_non_legal"
            ? "text-amber-700"
            : "text-slate-600"

      return `
        <div class="border border-slate-200 rounded-lg p-2.5 bg-white/75">
          <p class="text-xs font-medium text-slate-800 truncate" title="${escapeHTML(doc.name)}">${escapeHTML(doc.name)}</p>
          <p class="text-[11px] ${statusClass} mt-1">Status: ${escapeHTML(doc.status)}</p>
          <p class="text-[11px] text-slate-500">${formatBytes(doc.size)}</p>
          <div class="mt-2 flex justify-end">
            <button data-doc-delete="${doc.id}" class="text-xs px-2 py-1 border border-slate-300 rounded-md bg-white hover:bg-slate-50">Delete</button>
          </div>
        </div>
      `
    })
    .join("")
}

async function deleteDocument(documentId) {
  const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" })
  const data = await res.json()
  if (!data.ok) {
    setStatus(data.error || "Delete failed", true)
    return
  }
  setStatus("Document deleted")
  await loadDocuments()
}

async function uploadAndIndex(file) {
  const fd = new FormData()
  fd.append("file", file)

  setStatus("Uploading document...")
  const uploadRes = await fetch("/api/upload", { method: "POST", body: fd })
  const uploadData = await uploadRes.json()
  if (!uploadData.ok) {
    setStatus(uploadData.error || "Upload failed", true)
    return
  }

  setStatus("Document uploaded. Indexing...")
  const indexRes = await fetch(uploadData.index_path, { method: "POST" })
  const indexData = await indexRes.json()
  if (!indexData.ok) {
    setStatus(indexData.error || "Indexing failed", true)
    await loadDocuments()
    return
  }

  setStatus("Document indexed successfully")
  await loadDocuments()
}

if (uploadTrigger && chatFileInput) {
  uploadTrigger.addEventListener("click", () => chatFileInput.click())
  chatFileInput.addEventListener("change", async () => {
    const selected = chatFileInput.files && chatFileInput.files[0]
    if (!selected) return
    await uploadAndIndex(selected)
    chatFileInput.value = ""
  })
}

if (refreshDocs) {
  refreshDocs.addEventListener("click", () => {
    loadDocuments()
  })
}

if (docsList) {
  docsList.addEventListener("click", async (e) => {
    const target = e.target
    if (!(target instanceof HTMLElement)) return
    const id = target.getAttribute("data-doc-delete")
    if (!id) return
    await deleteDocument(id)
  })
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  const fd = new FormData(chatForm)
  const query = String(fd.get("query") || "").trim()
  if (!query) return

  addLine("You", query)
  chatForm.reset()

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
  const data = await res.json()
  addLine("Assistant", data.response || data.error || "No response")

  if (data.citations && data.citations.length) {
    addLine("Citations", data.citations.map((c) => `- ${c}`).join("\n"))
  }
})

loadDocuments()
