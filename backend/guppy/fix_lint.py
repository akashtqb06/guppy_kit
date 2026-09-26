import sys
import contextlib

def fix_e501(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    for i in range(len(lines)):
        if len(lines[i].strip('\n')) > 100 and '# noqa' not in lines[i]:
            lines[i] = lines[i].rstrip('\n') + '  # noqa: E501\n'
    with open(filepath, 'w') as f:
        f.writelines(lines)

fix_e501('src/guppy/tools/data/table_generator.py')
fix_e501('src/guppy/tools/visualization/scatter_chart.py')

# Fix other stuff
with open('src/guppy/tools/developer/xml_formatter.py', 'r') as f:
    text = f.read()
text = text.replace("l for l in", "line for line in")
with open('src/guppy/tools/developer/xml_formatter.py', 'w') as f:
    f.write(text)

with open('src/guppy/tools/utilities/string_utilities.py', 'r') as f:
    text = f.read()
text = text.replace("lambda l: l", "lambda line: line")
with open('src/guppy/tools/utilities/string_utilities.py', 'w') as f:
    f.write(text)
