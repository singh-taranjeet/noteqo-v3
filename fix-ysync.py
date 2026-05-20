file = "frontend/src/features/editor/components/extensions/BlockMetadata/BlockMetadataExtension.ts"
with open(file, "r") as f: content = f.read()

import_statement = "import { ySyncPluginKey } from 'y-prosemirror';\n"
if "ySyncPluginKey" not in content:
    content = import_statement + content

old_code = """          // Don't intercept metadata-only updates, otherwise it creates infinite loops.
          const isMetadataUpdate = transactions.some((tr) =>
            tr.getMeta("isMetadataUpdate"),
          );"""

new_code = """          // Don't intercept metadata-only updates, otherwise it creates infinite loops.
          const isMetadataUpdate = transactions.some((tr) =>
            tr.getMeta("isMetadataUpdate"),
          );
          
          // Ignore transactions that come from Yjs (remote updates)
          const isRemoteSync = transactions.some((tr) => tr.getMeta(ySyncPluginKey));"""

content = content.replace(old_code, new_code)

content = content.replace("if (!isDocChanged || isMetadataUpdate) {", "if (!isDocChanged || isMetadataUpdate || isRemoteSync) {")

with open(file, "w") as f: f.write(content)
