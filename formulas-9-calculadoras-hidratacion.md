# Especificación de fórmulas: 9 calculadoras de hidratación

Documento técnico para desarrollo. Versión 1.0, 22 de septiembre de 2026.

Cada calculadora incluye: entradas, fórmulas, constantes con su fuente, validaciones, salidas, advertencias obligatorias y casos de prueba con resultados esperados para usarlos como tests unitarios.

---

## 0. Estado de verificación (leer primero)

No todas las fórmulas tienen el mismo respaldo. Cada constante lleva una de estas etiquetas, y el texto que ve el usuario debe respetar la diferencia:

| Etiqueta | Significado | Cómo presentarla al usuario |
|---|---|---|
| **[OFICIAL]** | Valor publicado por un organismo (EFSA, IOM/NASEM, ACSM, ESPEN, AAHA) y verificado en la fuente. | "Según la EFSA…" |
| **[ESTUDIO]** | Dato de estudios científicos revisados, pero no una recomendación oficial. | "Estudios muestran…" |
| **[PRÁCTICO]** | Regla práctica de uso común, sin respaldo oficial fuerte. | "Como guía práctica…" o "estimación" |
| **[EDITABLE]** | Valor por defecto razonable que varía mucho; el usuario debe poder cambiarlo. | Campo editable con el valor precargado |

| # | Calculadora | Respaldo general |
|---|---|---|
| 1 | Electrolitos y sodio | OFICIAL (ACSM) + ESTUDIO (sudor) |
| 2 | Embarazo y lactancia | OFICIAL (EFSA e IOM) |
| 3 | Viajes, vuelos y altitud | ESTUDIO (vuelos) + PRÁCTICO (altitud). Es la de respaldo más débil. |
| 4 | Alcohol y cafeína | OFICIAL (límites de cafeína) + ESTUDIO + PRÁCTICO (agua por trago) |
| 5 | Mascotas | OFICIAL (AAHA, uso veterinario) |
| 6 | Alimentos hidratantes | ESTUDIO (contenido de agua de alimentos) |
| 7 | Ahorro en agua embotellada y plástico | EDITABLE (precios, peso de botellas, CO₂) |
| 8 | Escala de color de orina | ESTUDIO (escala de Armstrong, validada) |
| 9 | Adultos mayores y cuidadores | OFICIAL (ESPEN) |

---

## 1. Convenciones globales

### 1.1 Unidades internas

Calcula todo internamente en **fl oz, kg, g, mg y horas**, y convierte solo al mostrar.

```
1 fl oz (EE. UU.)  = 0.0295735 L
1 lb               = 0.45359237 kg
1 galón (EE. UU.)  = 3.78541 L
1 g de agua        = 0.0338 fl oz   (densidad 1.0, suficiente para este uso)
1 mmol de sodio    = 22.99 mg de sodio
1 g de sal (NaCl)  = 393.4 mg de sodio   → sodio_mg = sal_mg × 0.3934
Densidad del etanol = 23.3335 g/fl oz
```

### 1.2 Redondeo al mostrar

| Magnitud | Métrico | Imperial |
|---|---|---|
| Volumen menor a 1 L | múltiplos de 0.3 fl oz | 1 oz |
| Volumen de 1 L o más | 0.1 L | 1 oz |
| Sodio | múltiplos de 10 mg | múltiplos de 10 mg |
| Porcentajes | 1 decimal | 1 decimal |

Nunca redondees en pasos intermedios, solo en la salida.

### 1.3 Advertencia global obligatoria

Toda calculadora que recomiende volúmenes debe mostrar, en algún lugar visible:

> Orientación general para personas sanas, no es consejo médico. Si tienes enfermedad renal, cardíaca o hepática, o te han indicado restringir líquidos o sodio, sigue las indicaciones de tu médico.

Y en las que suben el consumo de líquidos (1, 2, 3 y 9), añadir:

> Beber en exceso también es peligroso: puede bajar el sodio en la sangre (hiponatremia).

---

## 2. Calculadora de electrolitos y sodio

**Propósito:** estimar cuánto sodio pierde una persona en el sudor durante el ejercicio y cuánto conviene reponer con bebidas.

### 2.1 Entradas

| Campo | Tipo | Rango válido | Notas |
|---|---|---|---|
| `sweat_rate_L_h` | número | 0.2 a 4.0 L/h | Idealmente viene de tu calculadora de tasa de sudoración. Permitir pegarlo o calcularlo. |
| `duration_h` | número | 0.25 a 24 h | |
| `sweat_profile` | selección | bajo / promedio / alto / medido | Ver 2.3 |
| `sweat_na_mg_L` | número | 230 a 2070 | Solo si `sweat_profile = medido` (test de sudor de laboratorio) |
| `fluid_intake_L_h` | número | 0 a 2.0 | Lo que la persona planea beber por hora |

### 2.2 Fórmulas

```
sweat_loss_L        = sweat_rate_L_h × duration_h
sodium_loss_mg      = sweat_loss_L × sweat_na_mg_L
salt_equiv_g        = sodium_loss_mg / 393.4

drink_volume_L      = fluid_intake_L_h × duration_h
drink_na_low_mg     = drink_volume_L × 500
drink_na_high_mg    = drink_volume_L × 700
replacement_pct_low  = drink_na_low_mg  / sodium_loss_mg × 100
replacement_pct_high = drink_na_high_mg / sodium_loss_mg × 100
```

Si la entrada viene en mmol/L: `sweat_na_mg_L = mmol_L × 22.99`.

### 2.3 Constantes

| Constante | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Sodio recomendado en la bebida, ejercicio de más de 1 h | **500 a 700 mg por litro** (0.5 a 0.7 g/L) | OFICIAL | ACSM Position Stand, Exercise and Fluid Replacement |
| Rango de sodio en el sudor | **230 a 2,070 mg/L** | ESTUDIO | Gatorade Sports Science Institute (datos de Baker y colaboradores) |
| Sodio en el sudor, perfil "promedio" | **920 mg/L** (40 mmol/L) | ESTUDIO + PRÁCTICO | Promedios de estudios de cuerpo entero rondan 38 a 40 mmol/L |
| Perfil "bajo" | **460 mg/L** (20 mmol/L) | PRÁCTICO | Categoría de diseño dentro del rango medido |
| Perfil "alto" (manchas blancas de sal en la ropa, ardor en los ojos) | **1,380 mg/L** (60 mmol/L) | PRÁCTICO | Categoría de diseño dentro del rango medido |

**Importante:** en internet se repite que la ACSM recomienda "300 a 600 mg de sodio por hora". En el texto de la ACSM que verifiqué la recomendación está expresada **por litro de bebida (0.5 a 0.7 g/L)**, no por hora. Usa la cifra por litro.

### 2.4 Reglas de negocio

- Si `duration_h < 1`: mostrar "Para ejercicio de menos de 1 hora, el agua sola suele ser suficiente". Aún así puedes mostrar la pérdida estimada.
- No es necesario reponer el 100% del sodio durante el ejercicio. Muestra el porcentaje de reposición como dato, sin marcarlo como error si es bajo.
- Los perfiles bajo, promedio y alto son **estimaciones**. Solo un test de sudor da el valor real; por eso existe la opción "medido".

### 2.5 Advertencias obligatorias

- No usar si la persona sigue una dieta baja en sodio por hipertensión, enfermedad renal o cardíaca.
- Las bebidas con sodio no evitan la hiponatremia si la persona bebe mucho más de lo que suda.

### 2.6 Casos de prueba

| Entradas | Resultado esperado |
|---|---|
| 1.0 L/h, 2 h, promedio (920), bebe 0.8 L/h | pérdida de sudor 2.0 L; sodio perdido **1,840 mg**; sal equivalente **4.68 g**; bebida 1.6 L; sodio en bebida **800 a 1,120 mg**; reposición **43.5% a 60.9%** |
| 1.5 L/h, 3 h, alto (1,380), bebe 1.0 L/h | pérdida 4.5 L; sodio **6,210 mg**; bebida 3.0 L; sodio en bebida **1,500 a 2,100 mg** |
| medido 50 mmol/L | `sweat_na_mg_L` = **1,149.5 mg/L** |

---

## 3. Calculadora de embarazo y lactancia

**Propósito:** meta diaria de agua para embarazadas y madres lactantes.

### 3.1 Entradas

| Campo | Tipo | Valores |
|---|---|---|
| `stage` | selección | no embarazada (referencia) / embarazada / lactando |
| `standard` | selección | EFSA (Europa, por defecto) / IOM (EE. UU.) |
| `age` | número | 14 a 50 (solo para validar) |

No pidas el trimestre para el cálculo: ni la EFSA ni el IOM dan valores distintos por trimestre. Puedes pedirlo solo para personalizar textos.

### 3.2 Fórmulas

**EFSA (agua total de bebidas y alimentos):**

```
base_total_fl_oz = 67.63
if stage == embarazada: total_fl_oz = base_total_fl_oz + 10.14
if stage == lactando:   total_fl_oz = base_total_fl_oz + 23.67

drinks_fl_oz = total_fl_oz × 0.80      // ~20% del agua viene de los alimentos
food_fl_oz   = total_fl_oz × 0.20
```

**IOM (valores de tabla, no se calculan):**

| Etapa | Agua total | De bebidas |
|---|---|---|
| Mujer 19 a 50 años (referencia) | 91.3 fl oz | 74.4 fl oz |
| Embarazo, 14 a 50 años | **101.4 fl oz** | **77.8 fl oz** |
| Lactancia, 14 a 50 años | **128.5 fl oz** | **104.8 fl oz** |

### 3.3 Constantes y fuentes

| Constante | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Ingesta adecuada de agua total, mujeres | 2.0 L/día | OFICIAL | EFSA 2010, Dietary Reference Values for water |
| Extra en embarazo | +10.1 fl oz/día | OFICIAL | EFSA 2010 (proporcional al aumento de energía) |
| Extra en lactancia | +23.7 fl oz/día | OFICIAL | EFSA 2010 (compensa el agua de la leche) |
| Embarazo total / bebidas | 3.0 L / 2.3 L | OFICIAL | IOM (NASEM) 2004, Dietary Reference Intakes for Water |
| Lactancia total | 3.8 L | OFICIAL | IOM 2004 |
| Lactancia bebidas | 3.1 L | OFICIAL | IOM 2004. Nota: la tabla original que consulté venía cortada en esta fila; confirmé 3.1 L en fuentes secundarias. Tu programador puede validarlo en la Tabla 1 del capítulo de agua en nap.edu. |
| Proporción de agua desde alimentos | ~20% | OFICIAL | EFSA y revisiones sobre la EFSA |
| Límite de cafeína en embarazo | 200 mg/día | OFICIAL | EFSA y ACOG |

**Aviso de datos:** una tabla de Today's Dietitian que aparece en búsquedas dice "3.8 L de bebidas" en lactancia. Es un error de esa tabla; el valor de bebidas es 3.1 L.

### 3.4 Reglas de negocio

- Mostrar un solo estándar a la vez, con selector. No mezclarlos ni promediarlos.
- Para calor o ejercicio, **no sumar factores inventados**: enlazar a tus calculadoras de clima caluroso y ejercicio.
- Mostrar el equivalente en vasos: `vasos = drinks_fl_oz / 8.45`.

### 3.5 Advertencias obligatorias

- Si hay náuseas o vómitos intensos (por ejemplo, hiperémesis), preeclampsia o una indicación médica de líquidos, seguir al médico.
- Mencionar el límite de 200 mg de cafeína al día, que enlaza con la calculadora de alcohol y cafeína (sección 5).

### 3.6 Casos de prueba

| Entradas | Resultado esperado |
|---|---|
| EFSA, embarazada | total **77.8 fl oz**; bebidas **62.2 fl oz**; alimentos 15.6 fl oz; vasos 7.4 |
| EFSA, lactando | total **91.3 fl oz**; bebidas **73.0 fl oz**; alimentos 18.3 fl oz |
| IOM, embarazada | total **101.4 fl oz**; bebidas **77.8 fl oz** |
| IOM, lactando | total **128.5 fl oz**; bebidas **104.8 fl oz** |

---

## 4. Calculadora de viajes, vuelos y altitud

**Propósito:** cuánto beber durante un vuelo largo y cuánto extra al día en altura.

**Advertencia de diseño:** esta es la calculadora con la evidencia más débil de las nueve. No existe una recomendación oficial con cifras de organismos como la OMS. El texto debe decir "estimación" en todas partes.

### 4.1 Modo vuelo

**Entradas:** `flight_hours` (0.5 a 20).

```
inflight_low_fl_oz  = flight_hours × 3.3814
inflight_high_fl_oz = flight_hours × 10.1439
inflight_mid_fl_oz  = flight_hours × 6.7628     // valor destacado
```

| Constante | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Ingesta durante vuelos largos | **3.4 a 10.1 fl oz por hora, incluyendo la comida** | ESTUDIO | Revisión narrativa en *Nutrients* (2020), "Up in the Air: Evidence of Dehydration Risk and Long-Haul Flight". Basada en pérdidas estimadas y estudios preliminares. |
| Humedad de cabina en crucero | 10 a 20% | ESTUDIO | Misma revisión |

Esta cifra es **lo que beber durante el vuelo**, no un extra que se sume a la meta diaria.

**Texto obligatorio:** el alcohol y el exceso de cafeína durante el vuelo empeoran la situación. Para vuelos largos, beber sin interrumpir el sueño: concentrar la ingesta en las horas despierto.

### 4.2 Modo altitud

**Entradas:** `altitude_m` (o pies: `m = ft × 0.3048`), `baseline_fl_oz` (meta diaria normal; puede venir de tu calculadora principal).

```
if altitude_m < 1500:          extra_low = 0,   extra_high = 0
if 1500 <= altitude_m < 2500:  extra_low = 0,   extra_high = 16.9    // ver nota
if altitude_m >= 2500:         extra_low = 33.8, extra_high = 50.7

target_low_fl_oz  = baseline_fl_oz + extra_low
target_high_fl_oz = baseline_fl_oz + extra_high
```

| Constante | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Extra en gran altura (2,500 m o más) | **+1.0 a 1.5 L/día**, total aproximado de 3 a 4 L | PRÁCTICO | Institute for Altitude Medicine (Telluride), citado por varias fuentes. No es un valor de la EFSA ni del IOM. |
| Pérdida respiratoria en altura | aproximadamente el doble que al nivel del mar | PRÁCTICO | Atribuido a la Wilderness Medical Society en fuentes secundarias |
| Tramo de 1,500 a 2,500 m (hasta +0.5 L) | — | PRÁCTICO | Umbral de diseño conservador. **No tiene fuente oficial.** Si prefieres solo usar datos con fuente, elimina este tramo y deja 0 extra por debajo de 2,500 m. |

### 4.3 Advertencias obligatorias

- Beber bien no previene el mal de altura. Si hay dolor de cabeza fuerte, confusión, falta de aire en reposo o torpeza al caminar, hay que descender y buscar atención médica.
- En altura la sed disminuye, así que conviene beber con horario, pero sin forzar grandes cantidades de golpe.

### 4.4 Casos de prueba

| Entradas | Resultado esperado |
|---|---|
| vuelo de 8 h | **27.0 a 81.1 fl oz**; destacado **54.1 fl oz** |
| vuelo de 2.5 h | 8.5 a 25.4 fl oz; destacado 16.9 fl oz |
| altitud 3,000 m, base 67.6 fl oz | **101.4 a 118.3 fl oz/día** |
| altitud 2,000 m, base 67.6 fl oz | 67.6 a 84.5 fl oz/día |
| altitud 8,000 ft | 2,438.4 m → tramo de 1,500 a 2,500 m |

---

## 5. Calculadora de alcohol y cafeína

**Propósito:** contar la cafeína diaria contra los límites oficiales, calcular tragos estándar de alcohol y sugerir agua para intercalar.

### 5.1 Parte A: cafeína

**Entradas:** lista de bebidas con cantidad de porciones.

```
caffeine_total_mg = Σ (servings_i × caffeine_per_serving_i)
pct_of_limit      = caffeine_total_mg / limit_mg × 100
limit_mg          = 400 (adulto)  |  200 (embarazo)
```

**Tabla de cafeína** (Mayo Clinic, versión actual de la página; valores aproximados, varían por marca y preparación) [ESTUDIO / EDITABLE]:

| Bebida | Porción | Cafeína (mg) |
|---|---|---|
| Café colado | 8 oz | 96 |
| Café descafeinado | 8 oz | 1 a 2 |
| Espresso | 1 oz | 63 |
| Café instantáneo | 8 oz | 62 |
| Té negro | 8 oz | 48 |
| Té verde | 8 oz | 29 |
| Refresco de cola | 8 oz | 33 |
| Bebida energética | 8 oz | 79 |
| Shot energético | 2 oz | 200 |

Para latas de 12 oz, escalar: `mg = mg_8oz × 1.5`. Permitir que el usuario escriba la cafeína de la etiqueta.

**Constantes:**

| Constante | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Límite diario, adultos sanos | 400 mg | OFICIAL | FDA y Dietary Guidelines for Americans |
| Límite diario, embarazo | 200 mg | OFICIAL | EFSA y ACOG |
| Dosis única que puede aumentar la orina | más de ~300 mg | ESTUDIO | Maughan y colaboradores, 2016 (*Am J Clin Nutr*) |

**Regla clave de hidratación:** las bebidas con cafeína **sí cuentan** como líquido. En el estudio del Índice de Hidratación de Bebidas (Maughan 2016), el café, el té y la cola produjeron la misma cantidad de orina en 4 horas que el agua. **No restes volumen por la cafeína.** Solo muestra un aviso si una sola toma supera ~300 mg.

### 5.2 Parte B: alcohol

**Entradas:** lista de bebidas con `volume_fl_oz`, `abv_pct` y porciones. Precargar: cerveza 12.0 fl oz al 5%, vino 5.1 fl oz al 12%, trago de destilado 1.5 fl oz al 40%, y un campo personalizado.

```
ethanol_g       = volume_fl_oz × (abv_pct / 100) × 23.3335
std_drinks      = ethanol_g / std_drink_g        // 14 g (EE. UU.) o 10 g (otros países)
water_suggest_fl_oz = std_drinks × 8.45           // un vaso de agua por trago estándar
```

| Constante | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Trago estándar en EE. UU. | 14 g de etanol | OFICIAL | NIAAA (equivale a 12.0 fl oz de cerveza al 5%, 5.1 fl oz de vino al 12% o 1.5 fl oz de destilado al 40%) |
| Trago estándar en otros países | 10 g | OFICIAL | Varía por país (Australia, varios de la UE). Hacerlo seleccionable. |
| Un vaso de agua (~8.5 fl oz) por trago | — | PRÁCTICO | Consejo de salud pública común ("alterna alcohol con agua"). No es una fórmula fisiológica. |

**Lo que la evidencia dice, para los textos:**

- Una cerveza de ~4% no produjo más orina que el agua en 4 horas (Maughan 2016). [ESTUDIO]
- Con la misma dosis de alcohol, el vino y los destilados sí aumentan la orina más que la cerveza (Polhuis 2017, *Nutrients*). [ESTUDIO]
- La cifra de "0.34 fl oz de orina por gramo de alcohol" que circula en internet viene de un estudio de 1942 con datos de una sola persona. **No la uses como fórmula.**

### 5.3 Advertencias obligatorias

- Esta herramienta no calcula el nivel de alcohol en la sangre ni indica si es seguro manejar. Si bebiste, no manejes.
- Beber agua entre tragos no evita la intoxicación ni la resaca.
- En embarazo no hay cantidad segura de alcohol.
- Si el usuario marca embarazo, ocultar la parte de alcohol y usar el límite de 200 mg de cafeína.

### 5.4 Casos de prueba

| Entradas | Resultado esperado |
|---|---|
| 2 cafés colados de 8 oz + 1 cola de 12 oz | cafeína **241.5 mg**; **60.4%** del límite de 400 |
| lo mismo, en embarazo | **120.8%** del límite de 200 → aviso |
| 2 cervezas de 12.0 fl oz al 5%, trago de 14 g | etanol **28.0 g**; **2.0** tragos estándar; agua sugerida **16.9 fl oz** |
| 1 copa de vino de 5.1 fl oz al 12%, trago de 10 g | etanol **14.3 g**; **1.43** tragos; agua **12.1 fl oz** |

---

## 6. Calculadora para mascotas (perros y gatos)

**Propósito:** agua diaria estimada para perros y gatos adultos sanos.

### 6.1 Entradas

| Campo | Tipo | Rango |
|---|---|---|
| `species` | selección | perro / gato |
| `weight_kg` | número | perro 1 a 90; gato 1 a 12 |
| `food_type` | selección | seca / húmeda / mixta |
| `food_g_day` | número | gramos de comida al día (opcional) |
| `food_moisture_pct` | número | de la etiqueta; por defecto: seca 10%, húmeda 78% |

### 6.2 Fórmulas

```
// Agua total de mantenimiento (incluye el agua de la comida)
if species == perro: total_fl_oz = 4.4635 × weight_kg^0.75
if species == gato:  total_fl_oz = 2.7052 × weight_kg^0.75

food_water_fl_oz = food_g_day × food_moisture_pct / 100 × 0.0338
drink_fl_oz      = max(0, total_fl_oz − food_water_fl_oz)
```

En JavaScript: `Math.pow(weight_kg, 0.75)`.

### 6.3 Constantes

| Constante | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Mantenimiento en perros | 4.4635 × kg^0.75 fl oz/día | OFICIAL (veterinaria) | AAHA Fluid Therapy Guidelines for Dogs and Cats (2013 y 2024); Merck Veterinary Manual |
| Mantenimiento en gatos | 2.7052 × kg^0.75 fl oz/día | OFICIAL (veterinaria) | Mismas fuentes |
| Humedad de comida seca | ~10% | EDITABLE | Usar la etiqueta ("humedad máx.") |
| Humedad de comida húmeda | ~75 a 82% | EDITABLE | Usar la etiqueta |

**Contexto técnico:** estas fórmulas vienen de guías de fluidoterapia clínica. Describen la necesidad total de agua de mantenimiento, que es lo correcto para esta herramienta, pero el texto debe decir "estimación para un animal adulto sano en reposo".

**Validación rápida:** la tabla de la AAHA da 14.9 fl oz/día para un perro de 5 kg. Con la fórmula: 4.4635 × 5^0.75 = 4.4635 × 3.344 = **14.9**. Coincide.

### 6.4 Reglas de negocio

- Mostrar el resultado como rango de ±20% alrededor del valor calculado. Esto es una decisión de diseño (PRÁCTICO), porque la ingesta real varía con la actividad y el clima.
- No aplicar a cachorros, gatitos, hembras lactando ni animales enfermos: mostrar "consulta a tu veterinario".

### 6.5 Advertencias obligatorias

- Si tu mascota empieza a beber mucho más de lo normal, llévala al veterinario: puede ser señal de diabetes, enfermedad renal u otros problemas.
- Siempre debe tener agua fresca disponible; no racionar el agua con base en esta cifra.

### 6.6 Casos de prueba

| Entradas | Resultado esperado |
|---|---|
| perro 5 kg | total **14.9 fl oz** |
| perro 20 kg, 300 g de comida seca al 10% | total **42.2 fl oz**; agua de comida 1.0 fl oz; a beber **41.2 fl oz** |
| gato 4 kg, 170 g de comida húmeda al 78% | total **7.7 fl oz**; agua de comida 4.5 fl oz; a beber **3.2 fl oz** |

---

## 7. Calculadora de alimentos hidratantes

**Propósito:** cuánta agua aportan las frutas, verduras y otros alimentos del día.

### 7.1 Fórmulas

```
water_fl_oz_i     = grams_i × water_pct_i / 100 × 0.0338
food_water_fl_oz  = Σ water_fl_oz_i
share_of_goal  = food_water_fl_oz / daily_total_goal_fl_oz × 100
```

`daily_total_goal_fl_oz` puede venir de tu calculadora principal. Si es una meta de **solo bebidas**, conviértela a total: `total = bebidas / 0.80`.

### 7.2 Constantes

| Constante | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Aporte típico de los alimentos | ~20% del agua total | OFICIAL | EFSA; Iowa State University Extension |

**Tabla de contenido de agua (% del peso)** [ESTUDIO]. Las fuentes consultadas difieren en ±1 a 2 puntos. **Recomendación:** que el programador tome los valores definitivos de USDA FoodData Central (la base oficial y gratuita del USDA) y guarde el ID de cada alimento.

| Alimento | % de agua | Estado |
|---|---|---|
| Pepino | 95 a 96 | verificado |
| Lechuga (iceberg, romana) | 95 a 96 | verificado |
| Apio | 95 | verificado |
| Tomate | 94 a 95 | verificado |
| Calabacín (zucchini) | 94 | verificado |
| Sandía (patilla) | 91 a 92 | verificado |
| Fresa | 91 | verificado |
| Toronja | 91 | verificado |
| Pimiento | 90 a 92 | verificado |
| Melón (cantaloupe) | 90 | verificado |
| Brócoli | 89 | verificado |
| Melocotón | 89 | verificado |
| Zanahoria | 86 a 88 | verificado |
| Naranja | 85 a 88 | verificado |
| Piña | 86 a 87 | verificado |
| Manzana | 84 a 86 | verificado |
| Guineo (banana) | 75 | verificado |
| Lechosa (papaya) | ~88 | **pendiente**: confirmar en USDA |
| Mango | ~83 | **pendiente**: confirmar en USDA |
| Agua de coco | ~95 | **pendiente**: confirmar en USDA |
| Tayota (chayote) | ~94 | **pendiente**: confirmar en USDA |

Incluí frutas tropicales porque tu público es dominicano, pero no pude verificarlas en esta revisión.

### 7.3 Porciones sugeridas para la interfaz [EDITABLE]

Permitir entrada en gramos o por porción ("1 taza", "1 unidad mediana"), con el peso de cada porción configurable por alimento. Los pesos de porción también están en FoodData Central.

### 7.4 Casos de prueba

| Entradas | Resultado esperado |
|---|---|
| 300 g de sandía al 91% | **9.2 fl oz** |
| 150 g de pepino al 96% + 200 g de naranja al 87% | 4.9 + 5.9 = **10.8 fl oz** |
| 10.8 fl oz con meta de bebidas de 67.6 fl oz | total = 84.5 fl oz; aporte **12.7%** |

---

## 8. Calculadora de ahorro en agua embotellada y plástico evitado

**Propósito:** comparar el costo anual del agua embotellada contra alternativas, y estimar el plástico y el CO₂ evitados.

Casi todo aquí es **EDITABLE**: los precios dependen del país y las cifras de plástico y CO₂ varían mucho entre estudios. Nunca presentes un precio por defecto como un hecho.

### 8.1 Entradas

| Campo | Por defecto | Notas |
|---|---|---|
| `daily_L` | 2.0 | Litros de agua al día (persona o familia) |
| `days_per_year` | 365 | |
| `bottle_size_L` | 0.5 | 0.5 / 1.5 / otro |
| `bottle_price` | vacío, obligatorio | En la moneda local del usuario |
| `alt_type` | botellón retornable / filtro / agua de la llave | |
| `jug_size_L` | 18.9 | Botellón de 5 galones |
| `jug_refill_price` | vacío, obligatorio | Precio de rellenar el botellón |
| `filter_upfront` | vacío | Costo del filtro o jarra |
| `filter_cartridges_per_year` | vacío | |
| `cartridge_price` | vacío | |
| `bottle_mass_g` | 10 para 0.5 L | Ver 8.3 |
| `co2_g_per_05L` | 100 | Ver 8.3; mostrar como rango |

### 8.2 Fórmulas

```
liters_year        = daily_L × days_per_year
bottles_year       = liters_year / bottle_size_L          // no redondear
cost_bottled_year  = bottles_year × bottle_price

// Alternativa: botellón retornable
jug_refills_year   = liters_year / jug_size_L
cost_jug_year      = jug_refills_year × jug_refill_price

// Alternativa: filtro
cost_filter_year   = filter_upfront + filter_cartridges_per_year × cartridge_price

savings_year       = cost_bottled_year − cost_alt_year

plastic_kg_year    = bottles_year × bottle_mass_g / 1000
co2_kg_year_low    = liters_year × (83  × 2) / 1000     // 83 g por 0.5 L
co2_kg_year_high   = liters_year × (111 × 2) / 1000     // 111 g por 0.5 L
```

Muestra `bottles_year` redondeado hacia arriba solo al final.

### 8.3 Constantes

| Constante | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Peso de botella PET de 0.5 L | ~9.3 a 9.9 g (promedio de la industria de EE. UU.) | EDITABLE | Cifras de la industria (IBWA). Un análisis del NIH (EE. UU.) da un rango de 13 a 26 g según el modelo. Por eso debe ser editable. |
| Peso de botellas de otros tamaños | sin valor verificado | EDITABLE | No encontré un promedio confiable. Pedirlo al usuario o escalar como estimación. |
| CO₂ por botella de 0.5 L (ciclo de vida) | 83 a 111 g CO₂e | ESTUDIO | 83 g: análisis de ciclo de vida coreano (2022). 111 g: estudio encargado por la industria de EE. UU. (2010). Un estudio italiano da ~113 g por 0.5 L. |

El CO₂ del agua de la llave varía por ciudad y es pequeño en comparación; si quieres, trátalo como 0 y dilo en el texto.

### 8.4 Reglas de negocio

- El botellón retornable reutiliza el envase, así que **no suma plástico por relleno** en esta estimación.
- Si el usuario no escribe precios, mostrar solo botellas, plástico y CO₂, no el ahorro en dinero.

### 8.5 Casos de prueba

| Entradas | Resultado esperado |
|---|---|
| 2 L/día, botellas de 0.5 L a RD$25 | 730 L/año; **1,460 botellas**; **RD$36,500/año** |
| lo mismo, botellón de 18.9 L a RD$100 | **38.6 rellenos**; **RD$3,862.43/año**; ahorro **RD$32,637.57** |
| 1,460 botellas × 9.9 g | plástico **14.45 kg/año** |
| 730 L/año | CO₂ **121.2 a 162.1 kg/año** |

Los precios en RD$ de esta tabla son valores de prueba, no precios reales.

---

## 9. Escala de color de orina (guía educativa)

**Propósito:** que el usuario compare el color de su orina con una escala y reciba una orientación general. No es una fórmula: es una tabla de consulta.

### 9.1 Escala

Basada en la escala de 8 colores de Armstrong (1994), validada contra la gravedad específica de la orina en adultos jóvenes y atletas [ESTUDIO]. La agrupación y los mensajes siguen la tabla de healthdirect (servicio de salud del gobierno australiano) [OFICIAL].

| Nivel | Grupo | Mensaje | Color de muestra (ilustrativo) |
|---|---|---|---|
| 1 | Hidratado | Sigue bebiendo al mismo ritmo. | `#FFFDE7` |
| 2 | Hidratado | | `#FFF6B3` |
| 3 | Hidratado | | `#FFEE80` |
| 4 | Algo deshidratado | Bebe un vaso de agua ahora. | `#FDE047` |
| 5 | Algo deshidratado | | `#F5C518` |
| 6 | Algo deshidratado | | `#E0A800` |
| 7 | Deshidratado | Bebe 2 a 3 vasos de agua ahora. | `#B8860B` |
| 8 | Deshidratado | | `#8B6914` |

**Los colores hex son una aproximación mía.** No existe un estándar digital oficial, y los colores cambian según la pantalla y la impresora. Las fuentes que revisé advierten que las copias de la tabla original suelen tener colores alterados. El texto debe decir que los colores son orientativos.

### 9.2 Reglas de negocio

- Pedir que la comparación se haga con la orina en un vaso transparente sobre fondo blanco y con buena luz, no en el inodoro.
- La primera orina de la mañana suele ser más oscura; indicarlo.
- **Si el usuario marca 65 años o más, no mostrar el resultado de hidratación.** La guía ESPEN de geriatría indica, con el grado de evidencia más alto, que el color de la orina **no debe usarse** para evaluar la hidratación en adultos mayores. Redirigir a la calculadora de adultos mayores (sección 10).

### 9.3 Advertencias obligatorias (red flags)

Mostrar siempre, fuera de la escala:

> Consulta a un médico si tu orina es roja, rosada, marrón o color refresco de cola; si hay dolor o ardor al orinar; o si sigue muy oscura aunque bebas suficiente agua.

> Algunos alimentos, vitaminas y medicamentos pueden cambiar el color de la orina.

---

## 10. Calculadora para adultos mayores y cuidadores

**Propósito:** meta diaria de bebidas para personas de 65 años o más, más un registro sencillo para cuidadores.

### 10.1 Entradas

| Campo | Tipo |
|---|---|
| `sex` | mujer / hombre |
| `wake_time`, `sleep_time` | hora |
| `fluid_restriction` | sí / no (si es sí, ver 10.4) |
| Registro | lista de tomas (hora, fl oz) |

### 10.2 Fórmulas

```
target_drinks_fl_oz = 54.1  (mujer)  |  67.6  (hombre)

waking_hours     = horas entre wake_time y sleep_time
per_hour_fl_oz      = target_drinks_fl_oz / waking_hours        // sugerencia de reparto

logged_fl_oz        = Σ tomas del día
progress_pct     = logged_fl_oz / target_drinks_fl_oz × 100

// Ritmo esperado a la hora actual (para alertas suaves al cuidador)
elapsed_h        = horas desde wake_time hasta ahora (máximo waking_hours)
expected_fl_oz      = per_hour_fl_oz × elapsed_h
behind_fl_oz        = max(0, expected_fl_oz − logged_fl_oz)
```

### 10.3 Constantes

| Constante | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Bebidas mínimas, mujeres mayores | al menos 1.6 L/día | OFICIAL | Guía ESPEN de nutrición clínica e hidratación en geriatría (2019) |
| Bebidas mínimas, hombres mayores | al menos 2.0 L/día | OFICIAL | ESPEN 2019 |
| Equivalencia con la EFSA | 2.0 y 2.5 L totales × 80% | OFICIAL | Revisiones sobre ESPEN y EFSA |
| Reparto por hora | — | PRÁCTICO | Decisión de diseño. ESPEN recomienda ofrecer bebidas con frecuencia, pero no fija una cantidad por hora. |

No uses fórmulas por peso corporal (como "1.0 fl oz por kg"): ESPEN no las usa y circulan versiones distintas.

### 10.4 Reglas de negocio

- **Si `fluid_restriction = sí`:** no mostrar la meta de ESPEN. Mostrar "Sigue la cantidad que indicó el médico" y dejar que el cuidador escriba esa meta manualmente. Es común en insuficiencia cardíaca y en algunas enfermedades renales.
- **No usar color de orina, sed, boca seca ni elasticidad de la piel como indicadores** en esta herramienta. ESPEN indica, con evidencia de grado A, que no sirven para evaluar la hidratación en adultos mayores.
- Las alertas al cuidador deben ser suaves ("Va un poco atrasada hoy, ofrécele algo de beber"), nunca alarmistas.

### 10.5 Textos de apoyo para el cuidador (basados en ESPEN)

ESPEN recomienda estrategias concretas: tener bebidas siempre a la vista y al alcance, ofrecer variedad según los gustos de la persona, ofrecer con frecuencia, y ayudarle a ir al baño con rapidez cuando lo necesite, porque el miedo a no llegar al baño hace que muchas personas mayores beban menos.

### 10.6 Advertencias obligatorias

> Busca atención médica si la persona está más confundida o somnolienta de lo normal, orina muy poco, tiene fiebre, vómitos o diarrea, o no puede beber.

### 10.7 Casos de prueba

| Entradas | Resultado esperado |
|---|---|
| mujer, despierta de 7:00 a 21:00 | meta **54.1 fl oz**; 14 h; **3.9 fl oz/h** |
| lo mismo, 37.2 fl oz registrados a las 18:00 | progreso **68.8%**; esperado 42.5 fl oz; atraso **5.3 fl oz** |
| hombre, de 8:00 a 22:00 | meta **67.6 fl oz**; **4.8 fl oz/h** |
| restricción = sí | sin meta ESPEN; campo de meta manual |

---

## 11. Fuentes verificadas

| Tema | Fuente |
|---|---|
| Sodio en bebidas deportivas | ACSM Position Stand: Exercise and Fluid Replacement (1996, 2007) |
| Sodio en el sudor | Baker LB, Sports Medicine 2017; Barnes y colaboradores, J Sports Sci 2019; Gatorade Sports Science Institute |
| Agua en embarazo y lactancia | EFSA Journal 2010; 8(3):1459. IOM/NASEM 2004, Dietary Reference Intakes for Water |
| Vuelos | *Nutrients* 2020; 12(9):2574, "Up in the Air" |
| Altitud | Institute for Altitude Medicine, citado en fuentes secundarias |
| Cafeína | Mayo Clinic (tabla de cafeína); FDA; Dietary Guidelines for Americans |
| Bebidas e hidratación | Maughan y colaboradores, Am J Clin Nutr 2016 (Beverage Hydration Index) |
| Alcohol | Hobson y Maughan, Alcohol Alcohol 2010; Polhuis y colaboradores, Nutrients 2017 |
| Mascotas | AAHA Fluid Therapy Guidelines 2013 y 2024; Merck Veterinary Manual |
| Alimentos | USDA FoodData Central (fuente recomendada); Iowa State University Extension |
| Botellas y CO₂ | NIH Environmental Management System; LCA coreano 2022; estudios de Italia y EE. UU. |
| Color de orina | Armstrong y colaboradores 1994 y 1998; healthdirect (Australia) |
| Adultos mayores | Volkert y colaboradores, ESPEN guideline on clinical nutrition and hydration in geriatrics, Clin Nutr 2019; Hooper y colaboradores, Am J Clin Nutr 2016 |
