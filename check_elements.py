import requests
import json
import time

base = 'https://ds360.imaginizedlabs.com'
headers = {'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0'}

time.sleep(2)
r = requests.get(f'{base}/api/templates', headers=headers, timeout=30)
templates = r.json()

with open('check_elements_result.txt', 'w') as f:
    f.write(f'Total templates: {len(templates)}\n')
    for t in templates:
        time.sleep(2)
        rid = t['id']
        try:
            r2 = requests.get(f'{base}/api/templates/{rid}', headers=headers, timeout=30)
            if r2.status_code == 200:
                d = r2.json()
                e = d.get('elements_json')
                f.write(f'{rid}: elements_json={"NULL" if e is None else "present"} name={d["name"]}\n')
            else:
                f.write(f'{rid}: ERROR {r2.status_code}\n')
        except Exception as ex:
            f.write(f'{rid}: EXCEPTION {ex}\n')

    f.write('Done.\n')
