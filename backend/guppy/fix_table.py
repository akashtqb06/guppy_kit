with open('src/guppy/tools/data/table_generator.py', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if line.strip().startswith('html_out = f"<table'):
        lines[i] = "            html_out = f'<table {style}><thead><tr>{headers}</tr></thead><tbody>{\"\".join(rows_html)}</tbody></table>'  # noqa: E501\n"
        
with open('src/guppy/tools/data/table_generator.py', 'w') as f:
    f.writelines(lines)
