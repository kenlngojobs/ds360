import json
with open('_backup_templates.json', encoding='utf-8') as f:
    data = json.load(f)
keys = list(data['store'].keys())
print('Store keys:', keys)
k = keys[0]
val = data['store'][k]
cc = val.get('canvasConfig', {})
print('First entry:', k)
print('canvasConfig keys:', list(cc.keys()))
print('Has globalTypography:', 'globalTypography' in cc)
if 'globalTypography' in cc:
    print('globalTypography keys:', list(cc['globalTypography'].keys()))
print('elements count:', len(val.get('elements', [])))