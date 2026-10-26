import json, sys, unicodedata
sys.path.insert(0, sys.argv[1])
from lista import L
foods = {f['id']: f for f in json.load(open(sys.argv[1] + '/foods.json'))}
q = lambda s: "'" + s.replace("'", "''") + "'"
def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')
num = lambda x: ('%.2f' % x).rstrip('0').rstrip('.')
frows, prows = [], []
for i, row in enumerate(L):
    grp, name, syn, fid, por = row[:5]
    aprox = len(row) > 5 and row[5]
    f = foods[fid]
    search = ' '.join(dict.fromkeys(norm(name + ' ' + syn).replace('(', ' ').replace(')', ' ').replace(',', ' ').split()))
    frows.append(f"  ({q(name)}, {q(grp)}, {q(search)}, {num(f['kcal'])}, {num(f['p'])}, {num(f['c'])}, {num(f['f'])}, {'true' if aprox else 'false'}, {fid}, {i + 1})")
    for j, (lab, g) in enumerate(por):
        prows.append(f"  ({q(name)}, {q(lab)}, {num(g)}, {j + 1})")
schema = """CREATE TABLE nutricion.foods (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  food_group  text NOT NULL,
  search      text NOT NULL,                 -- nombre y sinónimos en minúsculas y sin tildes, para el buscador
  kcal        numeric(6,1) NOT NULL,         -- todo por 100 g
  protein_g   numeric(5,2) NOT NULL,
  carbs_g     numeric(5,2) NOT NULL,
  fat_g       numeric(5,2) NOT NULL,
  approx      boolean NOT NULL DEFAULT false, -- sin equivalente exacto en USDA: se usa el más parecido
  usda_fdc_id integer NOT NULL,              -- de dónde salen los valores (FoodData Central)
  sort        smallint NOT NULL
);

-- Porciones caseras de cada alimento ("1 taza", "1 arepa mediana") con su peso en gramos.
CREATE TABLE nutricion.food_portions (
  id      integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  food_id integer NOT NULL REFERENCES nutricion.foods(id) ON DELETE CASCADE,
  label   text NOT NULL,
  grams   numeric(6,1) NOT NULL CHECK (grams > 0),
  sort    smallint NOT NULL
);

-- Una comida puede venir de la lista (alimento + gramos) o anotarse a mano (sin food_id).
-- Las kcal y gramos de la comida se guardan calculados, así no cambian si se corrige la lista.
ALTER TABLE nutricion.meals
  ADD COLUMN food_id integer REFERENCES nutricion.foods(id) ON DELETE SET NULL,
  ADD COLUMN grams   numeric(6,1) CHECK (grams > 0 AND grams <= 3000),
  ADD COLUMN portion text CHECK (length(portion) <= 60);

INSERT INTO nutricion.foods (name, food_group, search, kcal, protein_g, carbs_g, fat_g, approx, usda_fdc_id, sort) VALUES
""" + ',\n'.join(frows) + """;

INSERT INTO nutricion.food_portions (food_id, label, grams, sort)
SELECT f.id, v.label, v.grams, v.sort
FROM (VALUES
""" + ',\n'.join(prows) + """
) AS v(name, label, grams, sort)
JOIN nutricion.foods f ON f.name = v.name;
"""
head = """-- 011: OQUA — lista de alimentos para anotar comidas sin saber calorías (buscar + gramos o porción casera).
-- Valores por 100 g de USDA FoodData Central (dominio público, CC0; piden citar la fuente), nombres y
-- porciones en español escritos para Colombia. Generado por un script; para cambiar la lista, editarla y regenerar.
-- Ejecutar UNA vez, en local (DBeaver: Execute SQL Script) y en Supabase, después del 010.
BEGIN;

"""
open(sys.argv[2], 'w').write(head + schema + "\nCOMMIT;\n")
open(sys.argv[3], 'w').write("\n-- Lista de alimentos de OQUA (script 011): valores de USDA FoodData Central (CC0).\n" + schema)
print(len(frows), 'alimentos,', len(prows), 'porciones')
