# Lista de alimentos de OQUA

- `lista.py`: los alimentos (grupo, nombre en español, sinónimos para buscar, fdcId de USDA, porciones caseras en gramos, aproximado sí/no).
- `compact.py`: resume los JSON de USDA FoodData Central (SR Legacy 2018-04 y Survey/FNDDS 2024-10-31, descargados de https://fdc.nal.usda.gov/download-datasets/) en `foods.json`.
- `gen_sql.py`: genera `coatrack-backend/db/011_alimentos.sql` y el bloque para `instalacion_completa.sql`.

Datos de USDA: dominio público (CC0); piden citar "USDA FoodData Central". Para cambiar la lista: editar `lista.py`, regenerar y escribir un script nuevo (012…) para las bases que ya tienen el 011.
