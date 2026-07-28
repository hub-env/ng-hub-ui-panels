# ng-hub-ui-panels

**Español** | [English](./README.md)

Un contenedor de **paneles de contenido** versátil y accesible para Angular que se
renderiza como **tabs**, **pills**, **accordion** o simples **cards** desde una sola
API — con routing, formularios reactivos, navegación por teclado y theming con
variables CSS. Construido como componentes standalone de Angular sobre Signals.

> `ng-hub-ui-panels` sustituye a [`ng-hub-ui-accordion`](https://www.npmjs.com/package/ng-hub-ui-accordion). Su vista accordion es un reemplazo directo y más capaz.

## Documentación y ejemplos en vivo

Este paquete forma parte de [Hub UI](https://hubui.dev/), una colección de bibliotecas de componentes Angular para aplicaciones standalone.

- Documentación: https://hubui.dev/panels/overview/
- Ejemplos en vivo: https://hubui.dev/panels/examples/
- Hub UI: https://hubui.dev/

## 🧩 Familia `ng-hub-ui`

Esta biblioteca forma parte del ecosistema **ng-hub-ui**:

- [**ng-hub-ui-accordion**](https://www.npmjs.com/package/ng-hub-ui-accordion) _(obsoleto → usa panels)_
- [**ng-hub-ui-action-sheet**](https://www.npmjs.com/package/ng-hub-ui-action-sheet)
- [**ng-hub-ui-avatar**](https://www.npmjs.com/package/ng-hub-ui-avatar)
- [**ng-hub-ui-board**](https://www.npmjs.com/package/ng-hub-ui-board)
- [**ng-hub-ui-breadcrumbs**](https://www.npmjs.com/package/ng-hub-ui-breadcrumbs)
- [**ng-hub-ui-calendar**](https://www.npmjs.com/package/ng-hub-ui-calendar)
- [**ng-hub-ui-dropdown**](https://www.npmjs.com/package/ng-hub-ui-dropdown)
- [**ng-hub-ui-ds**](https://www.npmjs.com/package/ng-hub-ui-ds)
- [**ng-hub-ui-forms**](https://www.npmjs.com/package/ng-hub-ui-forms)
- [**ng-hub-ui-history**](https://www.npmjs.com/package/ng-hub-ui-history)
- [**ng-hub-ui-milestones**](https://www.npmjs.com/package/ng-hub-ui-milestones)
- [**ng-hub-ui-modal**](https://www.npmjs.com/package/ng-hub-ui-modal)
- [**ng-hub-ui-nav**](https://www.npmjs.com/package/ng-hub-ui-nav)
- [**ng-hub-ui-paginable**](https://www.npmjs.com/package/ng-hub-ui-paginable)
- [**ng-hub-ui-panels**](https://www.npmjs.com/package/ng-hub-ui-panels) ← Estás aquí
- [**ng-hub-ui-portal**](https://www.npmjs.com/package/ng-hub-ui-portal)
- [**ng-hub-ui-skeleton**](https://www.npmjs.com/package/ng-hub-ui-skeleton)
- [**ng-hub-ui-sortable**](https://www.npmjs.com/package/ng-hub-ui-sortable)
- [**ng-hub-ui-stepper**](https://www.npmjs.com/package/ng-hub-ui-stepper)
- [**ng-hub-ui-utils**](https://www.npmjs.com/package/ng-hub-ui-utils)

---

## 🚀 Inicio rápido

### 1. Instalar

```bash
npm install ng-hub-ui-panels
```

> **Tematización (recomendado):** instala los tokens compartidos una vez para que
> panels —y cualquier otra librería de ng-hub-ui— lea la misma paleta y el modo
> oscuro:
>
> ```bash
> npm install ng-hub-ui-ds
> ```
> ```css
> @import 'ng-hub-ui-ds/styles/tokens/hub-tokens.css';
> ```
>
> Es una peer dependency **opcional**: panels trae fallbacks sensatos y funciona
> sin ella, pero los tokens dan colores consistentes y tematizables en toda la
> familia (y alimentan las variantes del alert).

### 2. Importar

Los componentes son standalone — impórtalos directamente donde los uses:

```ts
import {
	PanelsComponent,
	PanelComponent,
	HubTabNavComponent,
	PanelHeadingDirective,
	PanelHeaderDirective,
	PanelFooterDirective
} from 'ng-hub-ui-panels';
```

### 3. Usar

```html
<hub-panels>
	<hub-panel heading="Resumen">Contenido del primer panel</hub-panel>
	<hub-panel heading="Detalles">Contenido del segundo panel</hub-panel>
	<hub-panel heading="Ajustes">Contenido del tercer panel</hub-panel>
</hub-panels>
```

---

## 📦 Descripción

`ng-hub-ui-panels` unifica los patrones de conmutación de contenido más
habituales — **tabs**, **pills** y **accordion** — más un layout **card** sin
cromo, tras un único componente declarativo. Coloca paneles `<hub-panel>` dentro
de `<hub-panels>` y elige un `type`; todo lo demás (navegación por teclado,
semántica ARIA, colapso animado, paneles enrutados y binding de formularios)
funciona igual en todas las vistas. Un `<hub-panel>` también puede usarse de forma
**standalone**, fuera de cualquier contenedor, donde se renderiza como una card por
sí mismo.

## 🎯 Características

- **Cuatro visualizaciones** — `tabs`, `pills`, `accordion` y `card`, con un único input `type`.
- **Tira ligera enlazada a valor** — `<hub-tab-nav>` es una tira de tabs controlada y sin contenido: emite el `value` seleccionado desde un array `items` y te deja renderizar la vista tú mismo (segmented controls, filtros, tabs con contenido externo).
- **Layout card y standalone** — `type="card"` renderiza cada panel como una card siempre visible; un único `<hub-panel>` también funciona por sí solo, fuera de cualquier contenedor.
- **Slots de cabecera/pie de contenido** — `hubPanelHeader` y `hubPanelFooter` marcan bandas de cabecera/pie que se renderizan en todas las vistas (distintas de la etiqueta de navegación `hubPanelHeading`).
- **Formularios** — implementa `ControlValueAccessor`; vincula el/los panel(es) activo(s) a un `FormControl` o `ngModel` (simple o `multiple`), con `bindValue` y `compareWith`.
- **Routing** — un panel con `routerLink` convierte el área de contenido en un `<router-outlet>` que sigue la URL.
- **Acento de la tira** — `<hub-panels variant>` recolorea la tira de navegación (tab activa/hover, pill activa, cabecera de accordion activa) desde un único acento semántico; las variantes integradas usan los tintes exactos del design system y cualquier acento personalizado se aplica automáticamente.
- **Teclado y accesibilidad** — tabindex móvil, teclas Flecha/Home/End/Delete y roles `role="tablist"`/`tab`/`tabpanel` y semántica `aria-expanded`/`aria-controls` para accordion.
- **Layout de la tira** — tiras de cabeceras `vertical`, `justified` y `scrollable`.
- **Opciones de accordion** — expansión `multiple`, layout `flush` a sangre y lado del chevron con `togglePosition` (`end` por defecto, consciente de RTL), con colapso animado basado en grid.
- **Acciones de fila del accordion** — `hubPanelHeadingActions` proyecta controles reales junto al botón de despliegue (nunca dentro), de modo que un lápiz o una papelera siguen siendo válidos, alcanzables por teclado y visibles con la fila plegada.
- **Cabeceras personalizadas** — proyecta cualquier marcado con la directiva `hubPanelHeading`.
- **Paneles eliminables** — paneles `removable` que se cierran con un botón ✕ o la tecla Delete.
- **Theming** — cada token es una variable CSS `--hub-panels-*`; la vista accordion también respeta el contrato `--hub-accordion-*`.

---

## 📦 Instalación

```bash
npm install ng-hub-ui-panels
```

### Peer dependencies

```json
{
	"@angular/common": ">=21.0.0",
	"@angular/core": ">=21.0.0",
	"@angular/forms": ">=21.0.0",
	"@angular/router": ">=21.0.0"
}
```

---

## ⚙️ Uso

### Tabs (por defecto)

```html
<hub-panels>
	<hub-panel heading="Uno">Primero</hub-panel>
	<hub-panel heading="Dos">Segundo</hub-panel>
</hub-panels>
```

### Pills

```html
<hub-panels type="pills"> … </hub-panels>
```

### Accordion

```html
<hub-panels type="accordion" multiple flush>
	<hub-panel heading="Envío">…</hub-panel>
	<hub-panel heading="Devoluciones">…</hub-panel>
</hub-panels>
```

#### Acciones de fila — `hubPanelHeadingActions`

`hubPanelHeading` se proyecta **dentro** del `<button>` de despliegue, así que no
puede alojar controles: un `<button>` anidado en otro botón es HTML inválido y no
se alcanza con el teclado. `hubPanelHeader` tampoco vale — vive dentro de la región
colapsable y desaparece al cerrar la fila.

`hubPanelHeadingActions` es la ranura para las afordancias de fila que deben seguir
siendo usables con la fila plegada. Se renderiza en la cabecera, **al lado** del
botón, de modo que sus controles son controles de verdad y un clic nunca despliega
el panel.

```html
<hub-panels type="accordion" multiple>
	<hub-panel>
		<ng-template hubPanelHeading>Dirección de envío</ng-template>
		<ng-template hubPanelHeadingActions>
			<button type="button" (click)="edit()">Editar</button>
			<button type="button" (click)="remove()">Eliminar</button>
		</ng-template>
		…
	</hub-panel>
</hub-panels>
```

#### Lado del chevron — `togglePosition`

`'end'` (por defecto) deja el chevron detrás del encabezado; `'start'` lo pone
delante. Solo cambia el orden visual — el DOM no se toca — y los desplazamientos son
lógicos, así que bajo `dir="rtl"` el chevron cae en el borde derecho sin una regla
extra.

```html
<hub-panels type="accordion" togglePosition="start">…</hub-panels>
```

Fija el valor por defecto de toda la app con `PanelsConfig`:

```ts
providers: [{ provide: PanelsConfig, useValue: { ...new PanelsConfig(), togglePosition: 'start' } }];
```

### Cards

`type="card"` elimina por completo la tira de navegación: cada panel está siempre
visible y se renderiza como una card. Usa los slots `hubPanelHeader` /
`hubPanelFooter` para las bandas de cabecera y pie de la card.

```html
<hub-panels type="card">
	<hub-panel>
		<div hubPanelHeader>Resumen del proyecto</div>
		Cada panel está siempre visible y estilizado como una card.
		<div hubPanelFooter>Actualizado hace 2 horas</div>
	</hub-panel>
	<hub-panel>
		<div hubPanelHeader>Equipo</div>
		Los mismos slots de cabecera/pie funcionan también en tabs, pills y accordion.
	</hub-panel>
</hub-panels>
```

Un único `<hub-panel>` puede usarse por sí solo, sin contenedor — se renderiza como
una card por sí mismo:

```html
<hub-panel>
	<div hubPanelHeader>Card standalone</div>
	Por sí solo, un hub-panel se renderiza como una card.
	<div hubPanelFooter>
		<button class="btn btn-sm btn-primary">Acción</button>
	</div>
</hub-panel>
```

> `hubPanelHeader` / `hubPanelFooter` son bandas de contenido dentro del cuerpo del
> panel y se renderizan en **todas** las vistas. Son distintas de `hubPanelHeading`,
> que es la etiqueta de navegación (tab) o el botón de disclosure del accordion.

#### Slots de card — `variant`, `flush`, `fill`

Una card simple expone tres inputs:

- **`variant`** — tiñe toda la card — fondo / texto / borde **y las bandas `hubPanelHeader` / `hubPanelFooter`** (un tinte algo más fuerte del mismo acento) — desde un único acento semántico (`primary` … `neutral`, o cualquier color), con el mismo modelo `color-mix` que usa el alert (sin añadir valores de color). `--hub-panels-card-border-style` fija el estilo del borde, p. ej. `dashed` para un estado vacío.
- **`flush`** — quita el padding del cuerpo para alojar una tabla / lista / media de borde a borde.
- **`fill`** — hace que la card ocupe el alto del padre y su cuerpo haga scroll, acotando por fin una región interna con `flex: 1`. `--hub-panels-body-gap` espacia los hijos apilados del cuerpo.

> **Dos inputs `flush` distintos.** `<hub-panel flush>` (este) pone a `0` el **padding del cuerpo del card** para que el contenido proyectado toque los bordes internos. `<hub-panels flush>` es un input aparte del **contenedor** que, en la vista accordion, quita el **chrome exterior** del accordion (bordes laterales + radio). Distinto elemento, distinta vista, distinto efecto — nunca colisionan.

```html
<hub-panel variant="success"><div hubPanelHeader>Success</div> Card teñida.</hub-panel>

<hub-panel flush>
	<div hubPanelHeader>Flush</div>
	<div>Va de borde a borde del card.</div>
</hub-panel>

<div style="height: 240px; display: flex;">
	<hub-panel fill style="flex: 1;"> …contenido largo con scroll… </hub-panel>
</div>
```

### Alertas

Un `<hub-panel>` independiente se convierte en una **alerta** semántica con
`appearance="alert"` y un `variant`. Cada variante mapea a la familia de tokens
`--hub-sys-color-<variant>-*` del design system —sin un set de variables por
color— así que la alerta hereda cada tema y el modo oscuro automáticamente.

```html
<hub-panel appearance="alert" variant="success">Tus cambios se han guardado.</hub-panel>
<hub-panel appearance="alert" variant="danger">Algo ha ido mal.</hub-panel>
<hub-panel appearance="alert" variant="warning">Tu prueba termina en 3 días.</hub-panel>
<hub-panel appearance="alert" variant="info">Hay una nueva versión disponible.</hub-panel>

<!-- Omite el variant para una alerta neutra -->
<hub-panel appearance="alert">Un aviso neutro.</hub-panel>

<!-- Las alertas admiten los mismos slots de cabecera/pie que las cards -->
<hub-panel appearance="alert" variant="danger">
	<div hubPanelHeader>Pago fallido</div>
	Actualiza tus datos de facturación para mantener activa tu suscripción.
	<div hubPanelFooter><button class="btn btn-sm btn-danger">Actualizar facturación</button></div>
</hub-panel>
```

> `variant` acepta los integrados `primary | success | danger | warning | info`
> (con los tintes exactos del design system) **o cualquier string personalizado**:
> la alerta lee `--hub-sys-color-<variant>` de tu app y deriva su aspecto con
> `color-mix`, así que tu propia paleta de acento funciona sin tocar nada aquí.
>
> ```html
> <!-- con `:root { --hub-sys-color-brand: #9333ea; }` definido en tu app -->
> <hub-panel appearance="alert" variant="brand">Aviso de marca</hub-panel>
> ```
>
> La apariencia de alerta se ignora en las vistas de strip `tabs` / `pills` / `accordion`.

### Acento de la tira (`variant`)

Pasa un `variant` a `<hub-panels>` para fijar el **acento semántico de la tira de
navegación**: la tab activa/hover, la pill activa y la cabecera de accordion
activa lo siguen. Re-basa un único `--hub-panels-accent` (con los roles derivados
`-emphasis` / `-subtle`), así que cambiar un solo acento recolorea toda la tira.

```html
<hub-panels variant="success"> … </hub-panels>
<hub-panels type="pills" variant="danger"> … </hub-panels>
<hub-panels type="accordion" variant="info"> … </hub-panels>
```

> `variant` acepta los integrados `primary | success | danger | warning | info`
> (con los tintes exactos del design system) **o cualquier string personalizado**:
> la tira lee `--hub-sys-color-<variant>` de tu app y deriva los roles hover/active
> con `color-mix`, así que tu propia paleta de acento funciona sin tocar nada aquí.
> Por defecto es `primary` si se omite. Mismo patrón abierto que el acento de
> `<hub-panel appearance="alert">`.

### Vertical / Justified / Scrollable

```html
<hub-panels vertical> … </hub-panels>
<hub-panels justified> … </hub-panels>
<div style="max-width: 360px">
	<hub-panels scrollable> … muchos paneles … </hub-panels>
</div>
```

### Formularios reactivos

```html
<hub-panels [formControl]="selected">
	<hub-panel heading="Claro" value="light">…</hub-panel>
	<hub-panel heading="Oscuro" value="dark">…</hub-panel>
</hub-panels>
```

```ts
selected = new FormControl<string>('dark');
```

Con `multiple`, el valor del formulario es un array. Usa `bindValue="meta.key"` para
mapear el `value` de cada panel a un primitivo, y `compareWith` para igualdad personalizada.

### Selección múltiple

Añade `multiple` para permitir varios paneles abiertos a la vez. En las vistas
`tabs` / `pills` los panes abiertos se renderizan lado a lado (o apilados, si es
`vertical`), cada uno con al menos `--hub-panels-pane-min-width` de ancho; el área
de contenido hace scroll cuando desbordan. En la vista `accordion` se expanden todos
los paneles seleccionados.

```html
<hub-panels multiple [formControl]="open">
	<hub-panel heading="Resumen" value="summary">…</hub-panel>
	<hub-panel heading="Estadísticas" value="stats">…</hub-panel>
	<hub-panel heading="Actividad" value="activity">…</hub-panel>
</hub-panels>
```

```ts
open = new FormControl<string[]>(['summary', 'stats']);
```

### Paneles enrutados

```html
<hub-panels>
	<hub-panel heading="Perfil" routerLink="/account/profile">Cargado vía router-outlet</hub-panel>
	<hub-panel heading="Facturación" routerLink="/account/billing">Cargado vía router-outlet</hub-panel>
</hub-panels>
```

Cuando el panel activo está enrutado, el área de contenido renderiza un
`<router-outlet>` y el panel activo sigue la URL actual (solo vistas `tabs` / `pills`).

### Cabeceras personalizadas

```html
<hub-panel>
	<ng-template hubPanelHeading>
		<i class="fa-solid fa-gear"></i> Ajustes <span class="badge text-bg-primary">3</span>
	</ng-template>
	Contenido del panel
</hub-panel>
```

---

## 🪄 Referencia de API

### Inputs de `<hub-panels>`

| Input | Tipo | Por defecto | Descripción |
| --- | --- | --- | --- |
| `type` | `'tabs' \| 'pills' \| 'accordion' \| 'card'` | `'tabs'` | Visualización del contenedor. `card` elimina la tira y muestra cada panel como una card. |
| `vertical` | `boolean` | `false` | Apila la tira junto al contenido (tabs / pills). |
| `justified` | `boolean` | `false` | Estira las cabeceras a igual ancho. |
| `scrollable` | `boolean` | `false` | Añade botones de scroll cuando la tira desborda. |
| `isKeysAllowed` | `boolean` | `true` | Activa la navegación por teclado. |
| `multiple` | `boolean` | `false` | Accordion: permite varios paneles expandidos a la vez. |
| `flush` | `boolean` | `false` | Accordion: layout a sangre sin marco exterior. |
| `bindValue` | `string` | `undefined` | Ruta dot-notation aplicada al valor de cada panel. |
| `compareWith` | `(a, b) => boolean` | `===` | Igualdad usada para cotejar valores de formulario. |

### Outputs de `<hub-panels>`

| Output | Payload | Descripción |
| --- | --- | --- |
| `panelChange` | `PanelChangeEvent` | Se emite al abrir un panel distinto (`{ current, prev }`). |

### Inputs de `<hub-panel>`

| Input | Tipo | Por defecto | Descripción |
| --- | --- | --- | --- |
| `heading` | `string` | `undefined` | Cabecera de texto (se ignora con `hubPanelHeading`). |
| `variant` | `HubSemanticColor \| string` | `undefined` | Solo card: tiñe toda la card desde un acento semántico (reflejado como `data-variant`). |
| `flush` | `boolean` | `false` | Solo card: quita el padding del cuerpo para contenido a sangre. |
| `fill` | `boolean` | `false` | Solo card: ocupa el alto del padre y hace scroll del cuerpo. |
| `standalone` | atributo | — | Atributo estático: saca un `<hub-panel>` suelto de un `<hub-panels>` ancestro para que renderice como card. |
| `id` | `string` | auto | Id para el emparejamiento ARIA. |
| `value` | `unknown` | `id` | Valor aportado al control de formulario. |
| `active` | `boolean` (model) | `false` | Estado activo/expandido bidireccional. |
| `disabled` | `boolean` | `false` | Impide la activación. |
| `removable` | `boolean` | `false` | Muestra una ✕ y habilita la tecla Delete. |
| `removeLabel` | `string` | `'Remove panel'` | Nombre accesible (`aria-label`) del botón ✕; sobrescríbelo para localizarlo. |
| `routerLink` | `string \| string[]` | `undefined` | Convierte el panel en un panel enrutado. |
| `queryParams` | `Params` | `undefined` | Query params para `routerLink`. |
| `pathMatch` | `'route' \| 'full'` | `'route'` | Comparación de URL para paneles enrutados. |
| `customClass` | `string` | `undefined` | Clases extra en el nav item y el panel. |

### Outputs de `<hub-panel>`

| Output | Payload | Descripción |
| --- | --- | --- |
| `selectPanel` | `PanelComponent` | Se emite cuando el panel se activa. |
| `deselectPanel` | `PanelComponent` | Se emite cuando el panel deja de estar activo. |
| `removed` | `PanelComponent` | Se emite al eliminarlo (✕ o Delete). |

### `<hub-tab-nav>` — tira ligera enlazada a valor

Una tira de tabs controlada y sin contenido. Renderiza solo la fila de cabeceras y
emite el `value` seleccionado; el consumidor renderiza la vista activa por su cuenta.

```html
<hub-tab-nav [items]="tabs" [(active)]="selected" appearance="pills" />
```

| Input | Tipo | Por defecto | Descripción |
| --- | --- | --- | --- |
| `items` | `HubTabNavItem[]` | `[]` | Los tabs seleccionables (`{ value, label, disabled?, id? }`). |
| `active` | `unknown` (model) | `undefined` | Valor seleccionado bidireccional; `activeChange` se emite al cambiar. |
| `appearance` | `'tabs' \| 'pills'` | `'tabs'` | Tabs subrayados o pills redondeados. |
| `justified` | `boolean` | `false` | Estira los tabs a igual ancho. |
| `vertical` | `boolean` | `false` | Apila la tira en vertical. |

| Output | Payload | Descripción |
| --- | --- | --- |
| `activeChange` | `unknown` | Se emite con el nuevo valor cuando cambia el tab seleccionado. |

### Directivas

- `hubPanelHeading` — marca un `<ng-template>` dentro de un `hub-panel` como su cabecera **de navegación** (enlace de tab/pill o botón de disclosure del accordion).
- `hubPanelHeader` — marca un elemento dentro de un `hub-panel` como la banda de **cabecera** de contenido, renderizada en la parte superior del cuerpo del panel en todas las vistas.
- `hubPanelFooter` — marca un elemento dentro de un `hub-panel` como la banda de **pie** de contenido, renderizada en la parte inferior del cuerpo del panel en todas las vistas.

### Configuración

Provee `PanelsConfig` para cambiar los valores por defecto en toda la aplicación:

```ts
providers: [{ provide: PanelsConfig, useValue: { ...new PanelsConfig(), type: 'pills' } }];
```

---

## 🎨 Estilos

Todo se tematiza con variables CSS `--hub-panels-*`. Consulta
[`docs/css-variables-reference.md`](./docs/css-variables-reference.md) para la lista completa.

```css
hub-panels {
	--hub-panels-tab-color-active: #198754;
	--hub-panels-pill-bg-active: #198754;
}
```

La vista `card` y las bandas de cabecera/pie tienen sus propios tokens
(`--hub-panels-card-*`, `--hub-panels-card-gap`, `--hub-panels-panel-header-*`).
Como un `<hub-panel>` standalone no tiene un ancestro `.hub-panels`, tematiza el
propio panel al estilizar cards independientes:

```css
hub-panel {
	--hub-panels-card-border-radius: 0.75rem;
	--hub-panels-panel-header-bg: #eef2ff;
}
```

La vista accordion también lee el contrato `--hub-accordion-*`, por lo que los temas
escritos para `ng-hub-ui-accordion` siguen funcionando.

---

## ♿ Accesibilidad

- `tabs` / `pills`: `role="tablist"`, `role="tab"`, `role="tabpanel"`, tabindex móvil y `aria-selected`.
- `accordion`: un botón de disclosure por panel con `aria-expanded` / `aria-controls` y una región colapsada inerte.
- Teclado: Flecha, Home y End mueven el foco; Delete elimina un panel `removable`; Enter/Espacio alternan las cabeceras de accordion.

---

## 📚 Migración desde `ng-hub-ui-accordion`

`ng-hub-ui-panels` sustituye a `ng-hub-ui-accordion`. Mapea el marcado así:

| Accordion | Panels |
| --- | --- |
| `<hub-accordion [multiple]="true">` | `<hub-panels type="accordion" multiple>` |
| `<hub-accordion [options]="{ flush: true }">` | `<hub-panels type="accordion" flush>` |
| `<hub-accordion-panel title="…">` | `<hub-panel heading="…">` |
| `<ng-template hubAccordionPanelHeader>` | `<ng-template hubPanelHeading>` |
| `(collapsedChange)` | `(panelChange)` |

El binding de formularios (`formControl` / `ngModel`, `value`, `bindValue`,
`compareWith`) funciona igual. Tus overrides de tema `--hub-accordion-*` se siguen aplicando.

---

## 📊 Changelog

Consulta [CHANGELOG.md](./CHANGELOG.md).

---

## 📄 Licencia

MIT © [Carlos Morcillo](https://www.carlosmorcillo.com)
