import os
import re

def fix_html_favicons(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find hrefs to assets/favicon/ with any number of leading relative path dots
    # e.g., href="assets/favicon/...", href="../assets/favicon/...", href="../../assets/favicon/..."
    # Matches both single and double quotes
    pattern = r'href=["\'](?:(?:\.\./)*)?assets/favicon/([^"\']+)["\']'
    
    # We replace it with href="/ezitom/assets/favicon/\1"
    new_content, count = re.subn(pattern, r'href="/ezitom/assets/favicon/\1"', content)
    
    # Also clean up duplicate favicon tags if they exist (common in the codebase)
    # Let's clean up any double declarations in the head to make it clean
    if count > 0:
        # Save updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {count} favicon hrefs in: {file_path}")

def main():
    root_dir = "."
    for root, dirs, files in os.walk(root_dir):
        # Skip node_modules and .git
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
            
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                fix_html_favicons(file_path)

if __name__ == "__main__":
    main()
