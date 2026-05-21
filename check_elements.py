import json

with open('_backup_templates.json', encoding='utf-8') as f:
    data = json.load(f)

for k, val in data['store'].items():
    if not k.startswith('seller'):
        elements = val.get('elements', [])
        if len(elements) > 0:
            print('Template:', k)
            print('Elements count:', len(elements))
            print('First element keys:', list(elements[0].keys()))
            print('First element type:', elements[0].get('type'))
            print('First element config keys:', list(elements[0].get('config', {}).keys()))
            print()
            break