import re

with open('src/guppy/tools/data/table_generator.py', 'r') as f:
    text = f.read()
text = text.replace('f"<table {style}><thead><tr>{headers}</tr></thead><tbody>{""', 'f"<table {style}><thead><tr>{headers}</tr></thead><tbody>{\\"\\"')
text = text.replace('<tbody>{"".join(rows_html)}</tbody></table>"', "<tbody>{''.join(rows_html)}</tbody></table>\"")
with open('src/guppy/tools/data/table_generator.py', 'w') as f:
    f.write(text)

with open('src/guppy/tools/data/toml_converter.py', 'r') as f:
    text = f.read()
text = re.sub(r'if sys\.version_info >= \(3, 11\):.*?import tomllib.*?else:.*?try:.*?import tomllib.*?except ImportError:.*?tomllib = None.*?(?=class)', 'import tomllib\n\n', text, flags=re.DOTALL)
text = text.replace('isinstance(v, int) or isinstance(v, float)', 'isinstance(v, (int, float))')
with open('src/guppy/tools/data/toml_converter.py', 'w') as f:
    f.write(text)

with open('src/guppy/tools/developer/uuid_generator.py', 'r') as f:
    text = f.read()
text = text.replace('import uuid\nfrom typing import Literal', 'import uuid\nimport contextlib\nfrom typing import Literal')
text = text.replace('            try:\n                ns = uuid.UUID(input.namespace)\n            except ValueError:\n                pass', '            with contextlib.suppress(ValueError):\n                ns = uuid.UUID(input.namespace)')
with open('src/guppy/tools/developer/uuid_generator.py', 'w') as f:
    f.write(text)

with open('src/guppy/tools/utilities/string_utilities.py', 'r') as f:
    text = f.read()
text = text.replace('else l.lower()', 'else line.lower()')
with open('src/guppy/tools/utilities/string_utilities.py', 'w') as f:
    f.write(text)
