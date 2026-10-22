@AGENTS.md

# OQUA (antes "Nutri") — contexto de la app

## Decisión 2026-10-22: Nutri pasa a llamarse OQUA
- OQUA era una idea propia del usuario (junio 2025): app para **tomar agua, fotos de progreso, calorías y recordatorios**. Tenía diseño en Figma pero casi nada de código. Nutri tenía la lógica pero no diseño propio. Se unieron: **la lógica de Nutri + la identidad y pantallas de OQUA**.
- **Ubicación:** `~/Desktop/Proyectos/OQUA`, repo GitHub `Sebasg006/OQUA` (rama `main`; el código vacío de 2025 quedó solo en el historial). `coatrack/nutricion-app` quedó como **respaldo** sin git; ya no se trabaja ahí.
- **Figma:** https://www.figma.com/design/zZtKzawLpRvaTDTY3yoyWR/oqua (17 pantallas: inicio azul, bienvenida, login, registro, datos, Home con tarjetas Calories/Water/Calendar y mascota, calculadora, agua "0/10" + "+1 Cup", cámara "Take", calendario "Your Progress", barra inferior Calendario/Inicio/Cámara). Colores azul `#3EB7FF`, negro y blanco; letra gruesa; mascota con gorra azul y gota (`assets/oqua/mascota.svg`). **Pulir, no rehacer**: mantener colores, mascota y estructura, con acabado profesional (cambiar fotos de stock por íconos/ilustraciones).
- **Fotos de progreso: solo en el teléfono** (nunca se suben). Decidido por el usuario.
- **Plan por pasos:** 1) identidad OQUA (nombre, colores, mascota, logo, íconos) sin tocar la lógica; 2) Home con el diseño de OQUA y barra inferior; 3) agua (meta de vasos, +1 vaso); 4) fotos de progreso + calendario; 5) recordatorios (notificaciones); 6) anotar comidas (el "paso 2" de Nutri).
- El backend sigue siendo el de Coatrack (esquema `nutricion`, rutas `/nutricion`); no se renombra.

---


App personal para **contar calorías y gramos (proteína, carbohidratos, grasa) y bajar de peso con déficit calórico**. Nació el 2026-10-20 como idea de la usuaria: hoy lo lleva en un chat de IA y las apps de la tienda son de pago. Es un **producto aparte de Coatrack** (la app de entrenadores): Coatrack no cambia por esta app.

## Reglas de trabajo con la usuaria (IMPORTANTE)
- Responder en español, explicaciones cortas. La usuaria está aprendiendo.
- **Un cambio a la vez, poco a poco**: el usuario quiere ir viendo la app en el teléfono después de cada paso ("no todo de golpe"). **En diseño de OQUA decide Claude** (2026-10-22 dijo "mejóralo a tu gusto" y rechazó los menús de opciones); preguntar solo decisiones de producto.
- **Nunca leer, imprimir ni editar archivos `.env`.**
- **Nunca ejecutar cambios de esquema** (CREATE/ALTER/DROP). Escribir el SQL en `coatrack-backend/db/` y que ella lo corra: en local con DBeaver (Option+X) y en producción en supabase.com → SQL Editor. Claude no puede tocar Supabase.
- Commits solo cuando lo pida. Repo `Sebasg006/OQUA`, rama `main`. Nunca crear ramas.
- Ella corre los comandos en sus terminales.
- Mismas reglas de dependencias que Coatrack: nunca `--legacy-peer-deps`, no usar `react-native-reanimated` (usar `Animated` de React Native), no correr `npx expo lint`. Revisar con `npx tsc --noEmit`. Instalar paquetes con `npx expo install`.
- Diseñar pensando primero en Android (ella prueba en iPhone y Samsung).

## Estructura
- **App:** `~/Desktop/Proyectos/OQUA/` (antes `coatrack/nutricion-app/`) — Expo SDK 57 + expo-router + TypeScript. Es una copia recortada de `coatrack-app` (mismo tema oscuro/dorado de `lib/theme.ts`, mismas letras y componentes: `Button`, `AuthInput`, `SegmentedControl`, `ProgressRing`, `Glow`, `DatePicker`, `ConfirmDeleteModal`, `FormScrollView`, `BackButton`, `HeaderEyebrow`…). Importar `router` desde `lib/router`, no desde `expo-router`.
- **Backend: el mismo de Coatrack** (`coatrack/coatrack-backend`, Express en Render). Rutas propias en `src/nutricion.ts`, montadas en `/nutricion` desde `src/index.ts`.
- **Base: la misma de Coatrack** (Postgres local / Supabase), pero en su **propio esquema `nutricion`**, separado de las tablas de Coatrack (`public`).

## Aislamiento con Coatrack (pregunta de la usuaria: "¿no dará usuarios o datos duplicados?")
- Cuentas en `nutricion.users`, no en `users` de Coatrack: el mismo correo puede tener cuenta en las dos apps sin chocar. Dentro de esta app el correo es `UNIQUE` (error 23505 → 409 "Ese correo ya está registrado", también si llegan dos registros a la vez).
- Los tokens de esta app llevan `app: 'nutricion'`. `requireNutricion` (en `src/nutricion.ts`) solo acepta esos; `requireAuth` de Coatrack (`src/auth.ts`) rechaza cualquier token con `app`. Una sesión nunca sirve en la otra app.
- Los cambios de esquema de esta app van como scripts numerados en `coatrack-backend/db/` (siguiendo la numeración de Coatrack) **y** dentro de `instalacion_completa.sql`.

## Base de datos (`coatrack-backend/db/008_nutricion.sql`)
- `nutricion.users` (id uuid, name, email único en minúsculas, password_hash bcrypt, created_at).
- `nutricion.profiles` (una fila por usuario, `ON DELETE CASCADE`): sex F/M, birth_date, height_cm 120–230, weight_kg 35–300, activity_level (sedentario…muy_activo), deficit_pct 0–25.

## Rutas del backend (`/nutricion/...`)
- `POST /register`: nombre, correo, contraseña 8–72 → `user` + `token` (30 días). **Sin confirmación de correo** (el correo no sale desde Render).
- `POST /login` → `user` + `token`.
- `GET /me` → `user` + `profile` (null si aún no llenó sus datos).
- `PUT /perfil`: crea o actualiza el perfil; rechaza menores de 18.
- `DELETE /cuenta`: borra la cuenta y su perfil (lo exigen las tiendas).

## App: pantallas y lógica
- `app/_layout.tsx`: con sesión y perfil → `index` (Hoy); con sesión sin perfil → `perfil` (paso obligatorio); sin sesión → `bienvenida`, `login`, `signup`. Pantalla "Conectando…" mientras despierta Render. Sin animación de entrada (la de Coatrack era su logo).
- `app/perfil.tsx`: "Cuéntanos de ti" (primera vez, botón "Calcular mi meta") o "Tus datos" (editar). Sexo, nacimiento con calendario (solo mayores de 18), estatura, peso, actividad (lista de 5), ritmo **Mantener 0 / Suave 10 / Moderado 20 / Rápido 25 %**. Vista previa de la meta y kg por semana. Aviso de estimación.
- `app/(tabs)/index.tsx` (Hoy / Inicio): saludo, anillo "kcal te quedan", Meta/Comido, barras de proteína/carbos/grasa, tarjeta "Cómo se calcula tu meta", fila "Cambiar mis datos o mi ritmo", aviso "no reemplaza a un nutricionista o médico". **Lo comido es 0 fijo** hasta el paso 2.
- `app/cuenta.tsx`: nombre, correo, eliminar cuenta (escribir ELIMINAR), cerrar sesión. Se abre con las iniciales arriba a la derecha.
- `lib/calorias.ts`: Mifflin-St Jeor × factor de actividad (1.2–1.9) = gasto; meta = gasto × (1 − déficit), redondeada a 10; **piso 1200 kcal mujeres / 1500 hombres** con déficit; proteína 2 g/kg con déficit (1,8 sin él), grasa 25 %, resto carbohidratos; kg/semana = (gasto − meta) × 7 / 7700. Verificado: mujer 30 años, 165 cm, 70 kg, ligero, 20 % → 1.560 kcal, 140 g proteína.
- `lib/authContext.tsx`: sesión + perfil; `saveProfile`. Token en SecureStore con la llave `nutricion_token`.
- `lib/brand.ts`: `APP_NAME = 'OQUA'`. Colores en `lib/theme.ts`: el acento se llama `accent` (azul `#3EB7FF`, antes `gold`) y `accentInk` (texto negro sobre el azul). `components/Logo.tsx` (nombre en texto, última letra azul) lo usa todavía `AuthTopBar` en login/registro.
- `app/bienvenida.tsx`: se probó (2026-10-22) una versión con la mascota grande + íconos 3D flotando y **al usuario no le gustó** ("se ve bastante mal, me gustaba más antes"); se volvió a la de Nutri (logo de texto OQUA, frase, botones). **La mascota no va en la bienvenida**; el usuario la quiere después como imagen de marca en otras partes (`assets/oqua/mascota.png`, `wordmark.png` listos).
- **Agua (2026-10-22, paso 3 adelantado a pedido: "en el Home no hay botones ni íconos"):** `components/WaterCard.tsx` en Hoy, debajo de Meta/Comido. Meta = 35 ml/kg en vasos de 250 ml (entre 6 y 14), `+1 vaso` y `−`. `lib/agua.ts` guarda **solo en el teléfono** con AsyncStorage (`oqua_agua_<userId>_<AAAA-MM-DD>`); no hay tabla en el backend todavía.
- **Pestañas (2026-10-22):** `app/(tabs)/` con `FloatingTabBar` (copiada de Coatrack, en azul): Calendario (`calendario.tsx`), Inicio (`index.tsx`, la antigua Hoy) y Cámara (`camara.tsx`). Calendario y Cámara son provisionales con `components/ComingSoon.tsx` (ícono 3D + "Muy pronto"). Las pantallas con pestañas dejan `useTabBarClearance()` de espacio abajo.
- **Íconos 3D:** Fluent Emoji de Microsoft (MIT) en `assets/icons3d/` con su `LICENSE`. Más en https://github.com/microsoft/fluentui-emoji (carpeta `assets/<Nombre>/3D/`).

## Cómo correrlo
1. Una sola vez: correr `coatrack-backend/db/008_nutricion.sql` en DBeaver (base local `coatrack`).
2. Backend: `cd coatrack/coatrack-backend && npm run dev` (puerto 3000).
3. App: `cd ~/Desktop/Proyectos/OQUA && npx expo start --lan` (Expo Go, misma wifi). La URL de la API se detecta sola (`lib/api.ts`).

## ▶️ RETOMAR AQUÍ (2026-10-22)
**Hecho hoy (commit `0adff44` en GitHub, main):** código pasado al repo OQUA; nombre OQUA y azul en toda la app (al usuario le encantó la pantalla Hoy en azul); bienvenida con mascota probada y revertida (no le gustó). **Siguiente:** proponer el siguiente cambio pequeño (p. ej. login/registro o el Home con tarjetas), luego ícono y pantalla de carga, luego paso 2 del plan (Home con tarjetas y barra inferior).

## Estado anterior (2026-10-21)
**Estado:** paso 1 hecho. Backend de Nutri **ya en GitHub y desplegado en Render** (el usuario hizo commit y push el 2026-10-21: `e544242`, junto con cambios de Coatrack). **008 aplicado en la base local** (2026-10-21, lo corrió Claude a pedido del usuario con un script node que carga el `.env` sin mostrarlo y aborta si el host no es local). **008 todavía pendiente en Supabase** → hasta correrlo, las rutas `/nutricion` fallan en internet (Coatrack no se afecta). (Desde 2026-10-22 la app vive en el repo OQUA.)
**Probando (2026-10-21):** el usuario abrió la app en Expo Go con `exp://192.168.1.2:8081` (Claude arrancó `npx expo start --lan` en segundo plano; sin QR visible, se escribe la URL a mano en Expo Go). Iba a crear cuenta, llenar el perfil y ver la pantalla Hoy. Falta su opinión.
**Aviso de Expo al arrancar:** expo 57.0.23 → ~57.0.30 disponible (y 4 paquetes más); no se actualizó.
**Paso 2 acordado:** buscar y anotar comidas. Ella eligió **base de datos gratuita, no IA**: Open Food Facts (productos empacados, código de barras) + USDA FoodData Central (alimentos sueltos, en inglés → buscador en español) + botón "Crear alimento" para lo que falte (platos colombianos). Necesita tablas nuevas (alimentos propios, registro del día) → script nuevo.
**Después:** registro de peso con gráfica (reutilizar `LineChart` de Coatrack); comidas frecuentes; recuperar/cambiar contraseña.
**Pendientes:** nombre definitivo y logo/íconos (hoy son los de Coatrack en `assets/`); proyecto EAS (`eas init`) antes del primer APK (`app.json` ya no tiene projectId ni `updates`; paquete Android `com.coatrack.nutricion`); política de privacidad propia antes de publicar.
**Futuro opcional:** conectar con Coatrack (que un entrenador vea lo que come su cliente). El aislamiento actual deja esa puerta abierta.
