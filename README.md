UpTeam · Mide y premia a tu comunidad con StellarPoints
UpTeam ordena a los integrantes de cualquier comunidad (tech, Web3, educativa o social): registra sus aportes, suma StellarPoints, asigna niveles y entrega premios. Cada movimiento de puntos queda registrado de forma pública y verificable en la blockchain de Stellar (Testnet).

Los StellarPoints no se transfieren como tokens a las billeteras de los integrantes. La blockchain se usa como un libro de registro inmutable: cada movimiento deja una huella pública que cualquiera puede auditar en Stellar Explorer.

Demo: https://v0-upteams.vercel.app

Índice
El problema que resolvemos
Funcionalidades
Enlace público de la comunidad
Cómo funciona en Stellar
Estados en la app
Costos
Seguridad
Limitaciones de Testnet
Pasar a Mainnet
Stack técnico
Estructura del proyecto
Puesta en marcha local
Variables de entorno
Novedades
Próximos pasos
El problema que resolvemos
Las comunidades crecen gracias al esfuerzo de sus integrantes, pero ese esfuerzo casi nunca se mide:

Antes	Con UpTeam
Aportes dispersos en chats y planillas	Todo registrado en un solo lugar
Nadie sabe quién suma más	Ranking visible y justo
Premios sin criterio claro	Recompensas verificables en Stellar
Nuestro diferencial: cada movimiento queda en la blockchain de Stellar para que cualquier persona lo consulte, y un asistente de IA sugiere cuántos puntos dar para evitar tareas manuales.

UpTeam lo creamos integrantes de comunidades que vivimos este problema mes a mes.

Funcionalidades
Sección	Ruta	Descripción
Inicio / Acceso	/login	Página web de presentación con el formulario de ingreso y registro arriba.
Dashboard	/	Métricas generales, distribución por nivel, ranking, cumpleaños y actividad reciente. Botón Compartir para generar el enlace público.
Integrantes	/embajadores	Listado, búsqueda, importación desde Excel y ficha individual (/embajadores/[id]). Suma de puntos individual, múltiple o a todos con un clic.
Niveles	/niveles	Explorador, Colaborador, Creador y Líder del ecosistema. Todos inician como Explorador y se promueven manualmente.
Reglas	/reglas	Acciones que suman o descuentan StellarPoints.
Premios	/premios	Catálogo y canje de premios.
Registro	/registro	Historial de todos los movimientos con enlace a Stellar Explorer.
Administración	/administracion	Configuración, bitácora de auditoría y Cuentas Stellar (clave pública y balance de la cuenta de registro).
Vista pública	/publico/[token]	Reporte de solo lectura del estado de la comunidad, accesible sin iniciar sesión.
Enlace público de la comunidad
Desde el Dashboard, el botón Compartir genera una URL única (/publico/<token>) para que toda la comunidad vea el estado actual del programa: métricas, ranking y actividad reciente con sus enlaces a Stellar.

Solo lectura: la vista pública no tiene botones de edición ni acceso a acciones del panel.
Bloquear o publicar: el administrador puede pausar el enlace en cualquier momento; mientras está bloqueado, la URL responde "no encontrado".
Regenerar: se puede crear un token nuevo para invalidar el anterior.
El token se guarda en la tabla enlaces_publicos de Neon.
Cómo funciona en Stellar
Por qué Stellar
Transacciones casi gratuitas: cada registro cuesta 0,00001 XLM (100 stroops).
Confirmación en ~5 segundos, con finalidad inmediata.
Exploradores públicos como stellar.expert, donde cualquiera puede auditar el historial sin necesitar una cuenta.
Testnet gratuita con fondeo automático mediante Friendbot, ideal para un piloto.
La cuenta de registro de la comunidad
La app usa una única cuenta de Stellar que actúa como "notario" del programa. Todas las transacciones se firman y envían desde esa cuenta.

La primera vez que se registra un movimiento, el servidor genera un par de claves (Keypair.random()).
Solicita fondos de prueba a Friendbot (https://friendbot.stellar.org/?addr=<clave_pública>), que deposita 10.000 XLM de testnet.
Guarda la clave pública y la secreta solo en el servidor (tabla config_stellar en Neon, o la variable STELLAR_SECRET_KEY si está definida, que tiene prioridad).
Las siguientes llamadas reutilizan esa misma cuenta.
Los integrantes no necesitan cuenta ni billetera de Stellar. Se identifican dentro de la transacción por su ID interno.

Anatomía de una transacción
Campo	Valor	Ejemplo
Red	Networks.TESTNET	Test SDF Network ; September 2015
Origen	Cuenta de registro de la comunidad	GCJM…QKI6
Comisión	BASE_FEE (100 stroops)	0,00001 XLM
Memo (texto, máx. 28 bytes)	Puntos con signo	+10 StellarPoints
Operación	manageData	—
↳ nombre (máx. 64 bytes)	Tipo de registro	StellarPoints
↳ valor (máx. 64 bytes)	idMovimiento|idIntegrante|puntos	mov_123|emb_45|+10
Timeout	60 segundos	—
Para los canjes de premios el formato es el mismo, con memo Premio <monto> <moneda> y la entrada manageData con nombre Premio.

Por qué manageData y no un pago: escribe un par clave/valor en la propia cuenta de registro, sin mover fondos ni crear tokens. Cada transacción queda en el historial público, pero no hay transferencias de valor, trustlines ni emisión de activos que administrar.

Flujo completo de un movimiento
El administrador suma, descuenta o revierte puntos (o se canjea un premio).
El movimiento se guarda de inmediato en Neon Postgres, así el saldo se actualiza al instante.
El cliente llama a la Server Action registrarMovimientosStellar (app/actions/stellar.ts), que se ejecuta solo en el servidor.
El servidor carga la cuenta desde Horizon Testnet para obtener el número de secuencia.
Construye la transacción, la firma y la envía.
Si Horizon responde tx_bad_seq o un timeout, reintenta hasta 3 veces con 1,5 s de espera.
Al confirmarse, guarda el tx_hash y marca el estado como confirmado.
En el Registro aparece el enlace "Ver en Stellar Explorer".
Las operaciones masivas (incluida "seleccionar todos") se procesan en lotes de hasta 50 movimientos por llamada, de forma secuencial para respetar el número de secuencia de la cuenta.

Cómo verificar un movimiento
Cualquier persona puede auditar un movimiento sin iniciar sesión:

En Registro (o en el enlace público de la comunidad), haz clic en "Ver en Stellar".
Se abre https://stellar.expert/explorer/testnet/tx/<hash>.
Ahí se ven la fecha y hora exactas, el memo, la operación manageData con el ID del movimiento y del integrante, y la cuenta que la firmó.
Estados en la app
Estado	Significado
Confirmado	La transacción está en Stellar Testnet; se muestra el enlace al explorador.
Registrando…	El movimiento ya está guardado y la transacción se está enviando a Stellar.
Error	El registro en Stellar falló. El saldo no se ve afectado y el chip incluye un botón para reintentar.
Histórico	Movimientos importados antes de activar la integración; no tienen transacción en la blockchain.
La base de datos es la fuente de verdad del saldo; Stellar es la prueba pública de cada movimiento.

Costos
Comisión por transacción: 0,00001 XLM.
Friendbot entrega 10.000 XLM de testnet, suficientes para unos mil millones de registros.
En Testnet el XLM no tiene valor real: el costo es cero.
Seguridad
La clave secreta nunca llega al navegador. Toda la firma ocurre en Server Actions.
Se prioriza la variable de entorno STELLAR_SECRET_KEY; la tabla config_stellar es solo un respaldo para el piloto.
Las entradas se validan (tipos, enteros, máximo 50 por llamada) y los textos se recortan a los límites de bytes de Stellar.
No se guardan datos personales en la blockchain: solo IDs internos y cantidades de puntos.
La vista pública solo expone datos de lectura y puede bloquearse o regenerarse en cualquier momento.
Limitaciones de Testnet
Stellar reinicia Testnet periódicamente (aproximadamente cada 3 meses); se borran la cuenta de registro y sus transacciones.
Después de un reinicio hay que borrar la fila registro de config_stellar, o cambiar STELLAR_SECRET_KEY, para que la app cree una cuenta nueva.
Pasar a Mainnet
Crear una cuenta en Mainnet y fondearla con XLM real.
Definir STELLAR_SECRET_KEY en Vercel con la clave de Mainnet.
En app/actions/stellar.ts, cambiar Networks.TESTNET por Networks.PUBLIC, Horizon por https://horizon.stellar.org y quitar Friendbot.
En lib/stellar.ts, cambiar EXPLORER_BASE a https://stellar.expert/explorer/public y STELLAR_RED a "Stellar Mainnet".
Stack técnico
Next.js 16 (App Router, Server Actions) y React 19
Tailwind CSS y componentes shadcn/ui
Neon Postgres con Drizzle ORM
Better Auth (email y contraseña)
@stellar/stellar-sdk v17 (Horizon, TransactionBuilder, Keypair)
Recharts para gráficos y SheetJS (xlsx) para importar y exportar Excel
Desplegado en Vercel
Estructura del proyecto
app/
  (app)/                  Dashboard, integrantes, niveles, reglas, premios, registro, administración
  login/                  Página web de presentación + acceso
  publico/[token]/        Vista pública de solo lectura de la comunidad
  actions/
    datos.ts              Lectura y escritura en Neon
    stellar.ts            Firma y envío de transacciones a Stellar Testnet
    enlace-publico.ts     Crear, bloquear y regenerar el enlace público
components/
  landing/                Hero con login, secciones, actividad en Stellar y tecnología
  dashboard/              Widgets y diálogo "Compartir enlace"
  embajadores/            Listado y diálogo "Sumar puntos" (con seleccionar todos)
lib/
  db/schema.ts            Esquema Drizzle (movimientos, config_stellar, enlaces_publicos…)
  data/publico.ts         Consultas de la vista pública
  stellar.ts              Constantes y utilidades de Stellar
  store.tsx               Estado de la app y orquestación del registro en Stellar
scripts/
  importar-excel.mjs      Importación inicial desde Excel
Puesta en marcha local
pnpm install
pnpm dev
La app queda disponible en http://localhost:3000.

Variables de entorno
Variable	Obligatoria	Descripción
DATABASE_URL	Sí	Cadena de conexión de Neon Postgres.
BETTER_AUTH_SECRET	Sí	Secreto para firmar las sesiones de Better Auth.
STELLAR_SECRET_KEY	No (recomendada)	Clave secreta (S…) de la cuenta de registro. Si no se define, la app crea y fondea una cuenta de testnet automáticamente.
Novedades
27–28 de noviembre de 2026
Nueva página web de inicio

El login ahora es una página web simple: qué es UpTeam, el problema que resuelve, 4 funciones principales y para quién es, con el acceso siempre arriba.
Menú superior con enlaces a Problema, Funciones, Stellar y Comunidades.
Ilustraciones 3D de comunidad, recompensas y comunidades del mundo.
Sección "Cada punto queda registrado en Stellar" con un ejemplo de actividad de integrantes de distintos países y su enlace a Stellar Explorer.
Pie con "Realizado con tecnología de Stellar" y el logo de Stellar SDK.
Mejor contraste de la ficha de acceso en modo oscuro.
Lenguaje para cualquier comunidad

Se reemplazó "embajadores" por "integrantes" en la web pública, para que UpTeam sirva a cualquier tipo de comunidad.
Enlace público de la comunidad

Botón "Compartir" en el Dashboard que genera una URL de solo lectura con el estado actual de la comunidad.
El enlace se puede bloquear, volver a publicar o regenerar.
Sumar puntos a todos

En el diálogo "Sumar puntos", opción "Seleccionar todos" que respeta el filtro de búsqueda activo.
v2.36 (noviembre 2026)
Acceso y cuentas

Login y registro con email y contraseña (Better Auth sobre Neon Postgres).
Contador de sesiones y fecha del último acceso de cada usuario.
Corregido el error "Invalid origin" al crear cuenta en producción.
Identidad del proyecto

Pie de página común: "Desarrollado por Betito Bascuñan gracias a Vercel · v2.36 · 10/2026".
Sello "Creado en la blockchain Stellar para registrar movimientos", con el logo de Stellar.
Favicon propio e imagen de vista previa (Open Graph y Twitter Card) para compartir por WhatsApp y redes.
Estado del proyecto
Etapa: Testnet. Cada movimiento de puntos se registra como una transacción en Stellar Testnet con un memo verificable, y la base de datos guarda su hash.

Próximos pasos (roadmap)
 Panel público de transparencia con el estado de la comunidad.
 Soporte multi-comunidad (varias comunidades en una misma cuenta).
 Contrato Soroban para los StellarPoints (emisión y canje on-chain).
 Conexión de la wallet de cada integrante con Freighter.
 Pasar a Mainnet cuando terminen las pruebas con usuarios reales.
Autor
Desarrollado por Roberto (Betito) Bascuñan, @rbascunan.
