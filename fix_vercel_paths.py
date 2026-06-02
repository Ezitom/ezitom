import os
import re

def fix_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Fix favicon paths: replace /ezitom/assets/favicon/ with assets/favicon/
    #    For admin files nested 2 levels deep (client/admin/), use ../../assets/favicon/
    #    For client/index.html nested 1 level, use ../assets/favicon/
    #    For root-level files, use assets/favicon/
    rel_path = os.path.relpath(file_path, start='.').replace('\\', '/')
    depth = rel_path.count('/')

    if depth == 0:
        favicon_prefix = 'assets/favicon/'
    elif depth == 1:
        favicon_prefix = '../assets/favicon/'
    else:
        favicon_prefix = '../../assets/favicon/'

    content = re.sub(r'/ezitom/assets/favicon/', favicon_prefix, content)

    # 2. Fix logo case: images/Logo/ -> images/logo/  (case-sensitive on Vercel/Linux)
    content = content.replace('images/Logo/', 'images/logo/')

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {rel_path}")

def main():
    for root, dirs, files in os.walk('.'):
        # Skip node_modules, .git, dist
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', 'dist')]
        for file in files:
            if file.endswith('.html'):
                fix_html_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
