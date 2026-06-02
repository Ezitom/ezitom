import os
import re

def fix_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Remove the EmailJS CDN script block (comment + script tag, across 3 lines)
    content = re.sub(
        r'\s*<!--\s*EmailJS SDK\s*-->[\s\S]*?emailjs/browser[^>]*>\s*</script>',
        '',
        content,
        flags=re.IGNORECASE
    )

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        rel = os.path.relpath(file_path, '.')
        print(f"Cleaned EmailJS CDN from: {rel}")

def main():
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', 'dist')]
        for file in files:
            if file.endswith('.html'):
                fix_html(os.path.join(root, file))

if __name__ == '__main__':
    main()
