import json, sys
d, out = sys.argv[1], sys.argv[2]
NUT = {1008: 'kcal', 1003: 'p', 1005: 'c', 1004: 'f'}
res = []
for fn, key, src in [('FoodData_Central_sr_legacy_food_json_2018-04.json', 'SRLegacyFoods', 'SR'), ('surveyDownload.json', 'SurveyFoods', 'FNDDS')]:
    for f in json.load(open(d + '/' + fn))[key]:
        n = {}
        for fnut in f.get('foodNutrients', []):
            nid = fnut['nutrient']['id']
            if nid in NUT and 'amount' in fnut:
                n[NUT[nid]] = fnut['amount']
        if 'kcal' not in n:  # SR a veces trae energía solo en kJ (1062)
            for fnut in f.get('foodNutrients', []):
                if fnut['nutrient']['id'] == 1062 and 'amount' in fnut:
                    n['kcal'] = round(fnut['amount'] / 4.184, 1)
        por = []
        for p in f.get('foodPortions', []):
            g = p.get('gramWeight') or 0
            if g <= 0: continue
            if src == 'SR':
                unit = p.get('measureUnit', {}).get('name', '')
                lab = f"{p.get('amount', p.get('value', 1))} {unit if unit != 'undetermined' else ''} {p.get('modifier', '')}".split()
                lab = ' '.join(lab)
            else:
                lab = p.get('portionDescription', '')
            por.append([lab, g])
        res.append({'src': src, 'id': f['fdcId'], 'd': f['description'], 'cat': (f.get('foodCategory') or {}).get('description') or (f.get('wweiaFoodCategory') or {}).get('wweiaFoodCategoryDescription'), **n, 'por': por})
json.dump(res, open(out, 'w'))
print(len(res))
