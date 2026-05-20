import re

file = "frontend/src/features/editor/components/editor-ui/BlockWrapper.tsx"
with open(file, "r") as f: content = f.read()

# Fix 1: Use onOpenChange on Popover to sync description
old_popover = "<Popover>"
new_popover = """<Popover onOpenChange={(open) => {
            if (open) setDescriptionInput(blockDescription || "");
          }}>"""
# Only replace the first Popover (which is the description one)
content = content.replace(old_popover, new_popover, 1)

# Fix 2: Remove the onFocus logic that was previously trying to sync it
old_input = """                    onFocus={() => {
                      if (!descriptionInput && blockDescription) {
                        setDescriptionInput(blockDescription);
                      }
                    }}"""
new_input = ""
content = content.replace(old_input, new_input)

# Fix 3: Sync it automatically if blockDescription changes while popover is not in focus? 
# Actually, onOpenChange is enough. But wait, what if we just add a useEffect?
# Let's add useEffect for descriptionInput just in case they are looking at the footer.
# Actually, the footer DOES use `blockDescription`.

with open(file, "w") as f: f.write(content)
