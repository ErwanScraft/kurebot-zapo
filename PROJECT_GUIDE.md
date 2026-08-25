# PROJECT GUILD

Project: KureBot-Zapo
Version: 1.0.0
Development Branch: build
Status: Active
Document Type: Architecture & Development Blueprint


==================================================
1. PURPOSE
==================================================

PROJECT_GUILD.md adalah blueprint teknis dan architectural contract
untuk project KureBot-Zapo.

Dokumen ini menjadi acuan utama bagi developer maupun AI ketika:

- membuat feature baru;
- memperbaiki bug;
- melakukan refactor;
- menambah module;
- mengubah startup lifecycle;
- mengubah database layer;
- mengubah command system;
- mengubah WhatsApp integration;
- mengubah configuration;
- melakukan optimasi;
- melakukan cleanup code.

Tujuan utama:

Menjaga struktur, naming, dependency direction, lifecycle,
configuration flow, responsibility, dan implementation pattern
KureBot-Zapo tetap konsisten.


==================================================
2. SOURCE OF TRUTH
==================================================

Branch build adalah development branch utama.

build = active development
main  = bukan baseline development aktif

Semua development baru harus mengacu pada kondisi terbaru
branch build.

Jika dokumentasi berbeda dengan implementasi:

1. Periksa implementasi aktual.
2. Identifikasi apakah perbedaan tersebut disengaja.
3. Jangan langsung mengubah kode hanya untuk mengikuti dokumentasi.
4. Jika architecture memang berubah, perbarui dokumentasi.
5. Dokumentasi tidak boleh mempertahankan architecture yang
   sudah tidak digunakan.


==================================================
3. CORE PRINCIPLES
==================================================

3.1 SEPARATION OF CONCERNS

Setiap module harus mempunyai satu responsibility utama.

Jangan menempatkan database logic di dalam command.

Jangan menempatkan WhatsApp event business logic di event adapter.

Jangan menempatkan media processing di banyak command apabila
sudah tersedia reusable media layer.

Jangan menempatkan startup orchestration di feature module.


3.2 EXPLICIT BOUNDARIES

Setiap subsystem harus mempunyai boundary yang jelas.

Consumer sebaiknya menggunakan public API subsystem daripada
mengakses implementation detail secara langsung.

Contoh:

command
    ↓
src/utils/media/index.js
    ↓
media implementation

Bukan:

command
    ↓
src/utils/media/sticker.js
src/utils/media/metadata.js
src/utils/media/internal.js

kecuali implementation detail tersebut memang merupakan
public API.


3.3 DEPENDENCY DIRECTION

Dependency harus bergerak dari orchestration menuju subsystem.

index.js
   ↓
bootstrap
   ↓
application initialization
   ↓
subsystems
   ↓
utilities / implementation

Contoh valid:

bootstrap → database
bootstrap → command engine
bootstrap → whatsapp
application → command
command → utility

Hindari:

utility → bootstrap
database → bootstrap
command feature → bootstrap

Circular dependency harus dihindari.


3.4 PREFER SMALL MODULES

Module harus cukup kecil untuk memiliki responsibility yang jelas.

Namun jangan memecah file hanya untuk mengurangi jumlah baris.

Pemisahan module harus mempunyai alasan:

- responsibility berbeda;
- dependency berbeda;
- lifecycle berbeda;
- reusable;
- public API berbeda;
- atau maintainability meningkat.


3.5 NO DEAD CODE

Kode yang tidak digunakan harus dihapus setelah dipastikan
tidak memiliki consumer atau side effect yang dibutuhkan.

Jangan meninggalkan:

- unused import;
- unused function;
- unused variable;
- duplicate helper;
- obsolete compatibility layer;
- commented-out implementation;
- legacy implementation;
- dead branch.


==================================================
4. PROJECT ARCHITECTURE
==================================================

Architecture utama:

index.js
   │
   ▼
bootstrap
   │
   ├── configuration
   ├── database
   ├── command engine
   ├── store
   ├── WhatsApp client
   ├── events
   └── sender
          │
          ▼
      application
          │
          ├── guards
          ├── command processing
          └── conversation processing

index.js hanya berfungsi sebagai entry point.

Bootstrap bertanggung jawab terhadap application startup.

Business logic berada di subsystem masing-masing.


==================================================
5. DIRECTORY ARCHITECTURE
==================================================

Struktur utama:

kurebot-zapo/
│
├── index.js
│
├── command/
│   ├── converter/
│   │   └── sticker.js
│   │
│   └── utility/
│       └── ping.js
│
├── config/
│   ├── config.example.yml
│   └── language/
│       └── id-ID.yml
│
├── src/
│   │
│   ├── command/
│   │   ├── executor.js
│   │   ├── index.js
│   │   ├── loader.js
│   │   ├── options.js
│   │   ├── registry.js
│   │   └── resolver.js
│   │
│   ├── database/
│   │   ├── connection.js
│   │   ├── index.js
│   │   ├── initDb.js
│   │   ├── migrate.js
│   │   ├── query.js
│   │   └── schema.js
│   │
│   ├── utils/
│   │   ├── guard/
│   │   ├── media/
│   │   ├── message/
│   │   ├── serialize/
│   │   ├── system/
│   │   └── terminal/
│   │
│   └── whatsapp/
│       │
│       ├── app/
│       │
│       └── bootstrap/
│
├── PROJECT_GUILD.md
└── package.json

Struktur ini merupakan baseline.

Jangan mengubah struktur utama tanpa alasan architecture
yang jelas.


==================================================
6. COMMAND ARCHITECTURE
==================================================

KureBot memiliki dua boundary command:

command/
    = feature implementation

src/command/
    = command engine


6.1 command/

Berisi feature yang dieksekusi user.

Contoh:

command/
├── converter/
│   └── sticker.js
└── utility/
    └── ping.js

Command feature tidak boleh menangani:

- command loading;
- registry;
- command discovery;
- database connection creation;
- WhatsApp client creation;
- bootstrap lifecycle.


6.2 src/command/

Berisi command infrastructure:

- loader;
- registry;
- resolver;
- executor;
- options.

Lifecycle:

Command File
     ↓
Loader
     ↓
Registry
     ↓
Resolver
     ↓
Executor


==================================================
7. COMMAND PUBLIC API
==================================================

src/command/index.js berfungsi sebagai facade/public API.

Consumer tidak perlu mengetahui implementation detail seperti:

- loader.js;
- registry.js;
- resolver.js;
- executor.js;
- options.js.

Public API harus diekspos melalui:

src/command/index.js

Jangan mengubah public API hanya untuk mempermudah satu
feature.

Jika public API diubah:

1. Cari semua consumer.
2. Update consumer.
3. Hapus API lama jika tidak lagi digunakan.
4. Pastikan tidak ada broken reference.
5. Pastikan tidak ada dead compatibility code.


==================================================
8. DATABASE ARCHITECTURE
==================================================

Database infrastructure berada di:

src/database/
├── connection.js
├── index.js
├── initDb.js
├── migrate.js
├── query.js
└── schema.js

Responsibility:

connection.js
    → connection / pool

query.js
    → query abstraction

schema.js
    → database schema

migrate.js
    → migration

initDb.js
    → database initialization

index.js
    → public database API


DATABASE RULES

Command tidak boleh membuat database connection sendiri.

Forbidden:

createPool(...)

di dalam command.

Database initialization hanya dilakukan melalui startup
lifecycle.

Migration tidak boleh berisi business logic.

Database abstraction harus digunakan kembali daripada
membuat query infrastructure baru.


==================================================
9. WHATSAPP ARCHITECTURE
==================================================

WhatsApp subsystem:

src/whatsapp/
├── app/
└── bootstrap/

Conceptual flow:

WhatsApp Client
      ↓
Bootstrap Events
      ↓
Application Processor
      ↓
Guard
      ↓
Command / Conversation


==================================================
10. BOOTSTRAP
==================================================

Bootstrap adalah composition root.

Bootstrap bertanggung jawab terhadap wiring subsystem dan
startup order.

Bootstrap boleh mengetahui:

- database;
- command engine;
- store;
- WhatsApp client;
- event registration;
- pairing;
- sender;
- configuration.

Subsystem tidak boleh bergantung kembali kepada bootstrap.


==================================================
11. STARTUP LIFECYCLE
==================================================

Startup mengikuti lifecycle:

index.js
   ↓
bootstrap
   ↓
load configuration
   ↓
startup presentation
   ↓
initialize database
   ↓
initialize commands
   ↓
create store
   ↓
create client
   ↓
register events
   ↓
register pairing
   ↓
initialize sender
   ↓
connect client

Bootstrap mengatur urutan.

Subsystem mengatur detail implementation.


==================================================
12. INITIALIZATION RULES
==================================================

Subsystem yang membutuhkan startup state harus memiliki
initialization atau creation function yang jelas.

Contoh:

await initializeDatabase()
await initializeCommands()

Gunakan naming yang menjelaskan responsibility.

Good:

initializeDatabase
initializeCommands
createStore
createClient
registerEvents
registerPairing
processMessage
executeCommand
loadCommands
resolveCommand

Avoid:

initializeEverything
setupStuff
doStartup
processStartup

kecuali function tersebut benar-benar hanya orchestration
dan context-nya jelas.


==================================================
13. CONFIGURATION ARCHITECTURE
==================================================

KureBot-Zapo menggunakan configuration sebagai shared
application dependency.

Configuration utama berasal dari:

config/config.yml

dan dimuat melalui:

loadConfig()

Configuration flow:

config/config.yml
       ↓
   loadConfig()
       ↓
application configuration
       ↓
runtime context
       ↓
subsystem / command


==================================================
14. CONFIGURATION SOURCE OF TRUTH
==================================================

Configuration source of truth harus mengikuti implementation
aktual.

Minimal sumber yang harus diperiksa:

src/utils/system/loadConfig.js
src/utils/system/index.js
config/config.yml
package.json

Jika diperlukan, periksa juga:

- bootstrap;
- command executor;
- command context;
- runtime initialization.


==================================================
15. MANDATORY CONFIGURATION INSPECTION RULE
==================================================

INI ADALAH ATURAN WAJIB UNTUK AI.

Sebelum AI menyimpulkan bahwa sebuah dependency:

- tidak ada;
- undefined;
- implicit;
- missing;
- global;
- tidak di-inject;

AI WAJIB memeriksa loadConfig() terlebih dahulu.

Minimal lakukan:

1. Periksa loadConfig().
2. Periksa config/config.yml.
3. Periksa bagaimana loadConfig() dipanggil.
4. Periksa bagaimana configuration disimpan/dialirkan.
5. Periksa command executor/context.
6. Periksa consumer.
7. Baru simpulkan dependency tersebut bermasalah atau tidak.


==================================================
16. CONFIGURATION DEPENDENCY RULE
==================================================

AI tidak boleh menyimpulkan dependency bermasalah hanya
karena dependency tidak terlihat langsung sebagai parameter
function.

Contoh:

async run({ main, m, send }) {
    // menggunakan configuration yang tersedia melalui runtime
}

Jangan langsung menyimpulkan:

"lang adalah missing dependency"
"bot adalah implicit dependency"
"configuration tidak tersedia"

Sebelum memeriksa:

- loadConfig();
- config/config.yml;
- runtime context;
- executor;
- consumer.


==================================================
17. CONFIGURATION RUNTIME
==================================================

Configuration yang berasal dari config.yml dianggap valid
application dependency apabila:

- mempunyai source of truth;
- dimuat melalui loadConfig();
- initialization lifecycle jelas;
- tersedia melalui runtime/application mechanism;
- consumer menggunakan mechanism yang memang dirancang project.

Configuration tidak wajib selalu dikirim sebagai function
parameter.

Contoh valid:

config.yml
    ↓
loadConfig()
    ↓
runtime configuration
    ↓
command context
    ↓
command


==================================================
18. NO DUPLICATE CONFIGURATION LOADER
==================================================

Feature atau command tidak boleh membuat configuration
loader sendiri.

Forbidden:

import fs from "node:fs"

const config = parseConfig(...)

jika project sudah menyediakan:

loadConfig()

Gunakan configuration mechanism existing.


==================================================
19. CONFIGURATION AUDIT PROTOCOL
==================================================

Ketika menemukan:

lang.description.sticker

atau:

bot.metadata.packname

AI harus melakukan:

Definition search
       ↓
loadConfig inspection
       ↓
config.yml inspection
       ↓
runtime flow inspection
       ↓
executor/context inspection
       ↓
consumer inspection
       ↓
architecture conclusion

Bukan:

Tidak terlihat di parameter
       ↓
anggap dependency missing


==================================================
20. CONFIGURATION REFACTORING
==================================================

Jika configuration flow memang perlu diperbaiki:

single source of truth
        ↓
single loading mechanism
        ↓
predictable runtime access

Jangan membuat abstraction configuration baru jika
loadConfig() yang ada sudah memenuhi kebutuhan.


==================================================
21. UTILITY ARCHITECTURE
==================================================

Utility dikelompokkan berdasarkan domain.

src/utils/
├── guard/
├── media/
├── message/
├── serialize/
├── system/
└── terminal/


guard/

Protection, anti-spam, dan abuse prevention.


media/

Media processing:

- conversion;
- metadata;
- encoding;
- transformation;
- temporary resources;
- cleanup.


message/

Message-specific helper.


serialize/

Message normalization, serialization, dan sender abstraction.


system/

System-level utility dan configuration-related logic.

Termasuk:

- loadConfig;
- system configuration;
- system helper.


terminal/

Terminal logger dan terminal output.


==================================================
22. UTILITY RULES
==================================================

Jangan membuat:

utils/helpers.js
utils/common.js
utils/misc.js

hanya sebagai tempat function yang tidak jelas.

Jika utility tidak cocok dengan domain existing:

1. Tentukan responsibility.
2. Tentukan domain.
3. Buat domain baru jika benar-benar diperlukan.
4. Jangan memasukkan function ke module yang salah.


==================================================
23. MEDIA ARCHITECTURE
==================================================

Reusable media processing berada di:

src/utils/media/

Command menggunakan public media API.

Flow:

command
   ↓
media public API
   ↓
media implementation

Command tidak boleh mengetahui implementation detail
yang tidak diperlukan.

Temporary resource harus dibersihkan setelah processing.

Cleanup harus tetap dilakukan ketika processing gagal.


==================================================
24. WHATSAPP EVENT RULES
==================================================

Event adapter harus tetap tipis.

events.js bertanggung jawab terhadap:

- event registration;
- authentication events;
- connection events;
- message events;
- forwarding ke application layer.

Event adapter tidak boleh menjadi tempat business logic.

Correct:

WhatsApp event
      ↓
processMessage()
      ↓
application logic

Incorrect:

WhatsApp event
      ↓
database query
      ↓
business logic
      ↓
command logic


==================================================
25. MESSAGE PROCESSING
==================================================

Application processor bertanggung jawab terhadap message
lifecycle.

Flow:

Incoming Message
      ↓
Serialize / Normalize
      ↓
Read / Message Metadata
      ↓
Guard / Anti-Spam
      ↓
Command Detection
      ↓
Command Execution
      ↓
Conversation / Fallback
      ↓
Error Handling

Guard harus dilakukan sebelum command execution.

Message processor tidak boleh membuat database connection
atau WhatsApp client baru.


==================================================
26. APPLICATION MODULE STRUCTURE
==================================================

Application processing berada di:

src/whatsapp/app/

Target structure:

src/whatsapp/app/
├── index.js
└── processMessage.js

index.js sebaiknya menjadi public facade.

Contoh:

export { processMessage } from "./processMessage.js"

Implementation berada di:

processMessage.js

Tujuannya agar index.js memiliki role yang konsisten
sebagai public API.


==================================================
27. NAMING CONVENTION
==================================================

Identifier kode menggunakan Bahasa Inggris.

Function menggunakan verb yang jelas:

initializeDatabase
initializeCommands
createClient
createStore
registerEvents
registerPairing
processMessage
executeCommand
loadCommands
resolveCommand


BOOLEAN NAMING

Gunakan prefix:

isGroup
isPremium
isOwner
isAdmin
useQr
initialized
blocked


FILE NAMING

Gunakan nama yang mencerminkan responsibility:

processMessage.js
loadConfig.js
systemInfo.js
createClient.js
registerEvents.js


==================================================
28. NAMING CLEANUP
==================================================

Identifier lama:

prosesMessage

harus menggunakan:

processMessage

Rename harus dilakukan pada:

- definition;
- import;
- invocation;
- export;
- consumer.

Setelah rename:

1. Cari seluruh consumer.
2. Ubah seluruh import.
3. Ubah seluruh invocation.
4. Pastikan tidak ada reference lama.
5. Hapus identifier lama.

Jangan meninggalkan alias compatibility apabila tidak
diperlukan.


==================================================
29. BOOTSTRAP NAMING
==================================================

File:

src/whatsapp/bootstrap/system.js

Jika hanya berisi system information/presentation,
sebaiknya menggunakan:

src/whatsapp/bootstrap/systemInfo.js

Tujuannya menghindari ambiguity dengan:

src/utils/system/

Perubahan ini adalah structural polish.

Priority: P2.


==================================================
30. LOGGING RULES
==================================================

Gunakan logger abstraction project.

Contoh:

logger.info(...)
logger.success(...)
logger.warn(...)
logger.error(...)

console.log() hanya digunakan apabila memang diperlukan
untuk terminal interaction khusus.

Contoh:

- QR output;
- pairing interaction;
- interactive terminal output.

Jangan mengganti system logger dengan console.log()
secara sembarangan.


==================================================
31. LOGGER BOUNDARY
==================================================

Jika terdapat lebih dari satu logger abstraction:

src/utils/terminal/logger.js
src/utils/system/systemLogger.js

AI tidak boleh langsung menggabungkan keduanya.

Pertama periksa:

1. responsibility masing-masing;
2. consumer;
3. output format;
4. lifecycle;
5. dependency;
6. apakah keduanya memang memiliki tujuan berbeda.

Baru tentukan apakah:

- merge;
- rename;
- keep separate.


==================================================
32. ERROR HANDLING
==================================================

Error harus ditangani pada boundary yang tepat.

Rules:

- jangan swallow error tanpa alasan;
- jangan duplicate logging;
- error harus memiliki context;
- error yang tidak dapat dipulihkan diteruskan ke parent boundary;
- cleanup dilakukan ketika resource sudah dibuat;
- jangan mengubah error menjadi pesan generic terlalu awal;
- stack trace harus tetap tersedia pada development/debugging.


==================================================
33. INITIALIZATION IDEMPOTENCY
==================================================

Subsystem singleton-like boleh memiliki protection
terhadap initialization berulang.

Contoh:

if (initialized) return

Namun jangan menggunakan idempotency untuk menutupi
desain startup yang salah.

Idempotency digunakan untuk melindungi lifecycle subsystem.


==================================================
34. IMPORT RULES
==================================================

Gunakan alias yang sudah tersedia pada package.json.

Contoh:

import { logger } from "#utils/terminal"
import { initializeDatabase } from "#database"
import { initializeCommands } from "#command"

Jangan membuat alias baru hanya untuk satu module.

Sebelum mengubah import:

1. Periksa package.json.
2. Periksa mapping alias.
3. Cari seluruh consumer.
4. Pastikan tidak menghasilkan broken import.


==================================================
35. PUBLIC API RULES
==================================================

Directory yang memiliki:

index.js

harus jelas apakah index.js berfungsi sebagai:

public facade

atau:

implementation

Prefer:

index.js
    = public API

implementation.js
    = actual implementation

Contoh:

src/utils/media/
├── index.js
├── metadata.js
└── sticker.js

src/database/
├── index.js
├── connection.js
├── query.js
└── initDb.js

Public API tidak perlu mengekspos seluruh implementation
detail.


==================================================
36. BACKWARD COMPATIBILITY
==================================================

Sebelum mengubah:

- public function;
- export;
- command contract;
- database structure;
- module path;
- configuration contract;

lakukan:

1. Search all consumers.
2. Evaluate impact.
3. Update consumers.
4. Remove obsolete API.
5. Validate no broken reference.

Compatibility layer tanpa consumer nyata adalah technical debt.


==================================================
37. FORBIDDEN PATTERNS
==================================================

Forbidden:

❌ Database connection langsung dari command.

❌ WhatsApp client creation dari command.

❌ Command registry manipulation dari feature command.

❌ Business logic di WhatsApp event adapter.

❌ Database logic di media utility.

❌ Media processing tersebar di banyak command.

❌ Duplicate configuration loader.

❌ Duplicate logger tanpa alasan.

❌ Duplicate serializer.

❌ Duplicate database connection.

❌ Circular dependency.

❌ Global mutable singleton tanpa kebutuhan.

❌ Commented-out legacy implementation.

❌ Unused import.

❌ Unused function.

❌ Dead code.

❌ Feature command di src/command.

❌ Infrastructure implementation di command.

❌ Abstraction sebelum ada kebutuhan nyata.

❌ Menyimpulkan dependency missing tanpa memeriksa
   loadConfig().

❌ Membuat configuration loader baru di feature.

❌ Mengubah architecture berdasarkan asumsi tanpa audit
   consumer.


==================================================
38. REFACTORING RULES
==================================================

Refactor harus menghasilkan setidaknya salah satu:

- clearer responsibility;
- healthier dependency;
- less duplication;
- better maintainability;
- better performance;
- clearer lifecycle.

Jangan melakukan refactor besar hanya untuk cosmetic change.


==================================================
39. SCOPE CONTROL
==================================================

Setiap perubahan harus memiliki scope.

Contoh:

Jika memperbaiki:

command/converter/sticker.js

jangan otomatis mengubah:

- database;
- bootstrap;
- command registry;
- logger;
- configuration;

kecuali memang ada dependency yang mengharuskan perubahan
tersebut.

Jika perubahan lintas subsystem diperlukan:

- jelaskan root cause;
- jelaskan dependency;
- jelaskan impact.


==================================================
40. AI DEVELOPMENT PROTOCOL
==================================================

AI wajib mengikuti workflow berikut.


PHASE 1 — INSPECT

Sebelum menulis kode:

1. Periksa branch build.
2. Periksa struktur directory.
3. Baca target file.
4. Cari consumer.
5. Cari dependency.
6. Periksa public API.
7. Periksa configuration flow jika relevan.
8. Tentukan scope.


PHASE 2 — PLAN

Gunakan:

Problem
   ↓
Root Cause
   ↓
Affected Module
   ↓
Required Change
   ↓
Potential Cleanup
   ↓
Validation

Jangan langsung menulis kode berdasarkan asumsi.


PHASE 3 — IMPLEMENT

Saat implementasi:

- gunakan abstraction existing;
- ubah bagian minimal;
- hindari duplicate implementation;
- pertahankan naming;
- pertahankan architecture;
- jangan memperluas scope tanpa alasan.


PHASE 4 — CLEANUP

Setelah implementasi:

- unused import;
- unused function;
- unused variable;
- duplicate logic;
- obsolete compatibility layer;
- legacy comment;
- broken import;
- old naming.

harus diperiksa.


PHASE 5 — VALIDATE

Validasi:

- Architecture;
- Code;
- Imports;
- Initialization;
- Configuration;
- Database;
- WhatsApp;
- Command;
- Media;
- Error Handling;
- Cleanup.


==================================================
41. MANDATORY DEPENDENCY AUDIT PROTOCOL
==================================================

Setiap kali AI menemukan dependency yang tampak tidak jelas:

1. Search definition.
2. Search imports.
3. Search consumers.
4. Inspect configuration.
5. Inspect loadConfig().
6. Inspect runtime context.
7. Inspect initialization lifecycle.
8. Inspect executor/registry apabila command-related.
9. Baru simpulkan.

AI tidak boleh menggunakan pola:

Tidak terlihat di function parameter
        ↓
berarti dependency missing


==================================================
42. CODE CHANGE REPORTING
==================================================

Setiap perubahan kode harus menyertakan:

FILE YANG BERUBAH

Contoh:

src/example/file.js


PERUBAHAN

Jelaskan perubahan secara singkat.


KODE TERBARU

Tampilkan bagian kode terbaru yang berubah.


KODE YANG HARUS DIHAPUS

Jika ada:

Kode yang harus dihapus:
<old code>


ALASAN PENGHAPUSAN

Jelaskan alasan singkat.


LOKASI

Contoh:

src/utils/media/sticker.js
function createSticker()


Jika tidak ada kode yang harus dihapus:

"Tidak ada bagian kode lama yang perlu dihapus."


Tujuannya:

Setiap perubahan harus menghasilkan structure yang bersih
dan tidak meninggalkan dead code.


==================================================
43. CLEANUP REQUIREMENT
==================================================

Setiap refactor wajib mengevaluasi:

- unused import;
- unused function;
- unused variable;
- duplicate helper;
- legacy implementation;
- obsolete comment;
- old API;
- old naming;
- unused compatibility layer.

Cleanup tidak boleh dilakukan dengan menghapus kode
tanpa terlebih dahulu memeriksa consumer.


==================================================
44. CHANGE CHECKLIST
==================================================

ARCHITECTURE

[ ] Responsibility module jelas.
[ ] Dependency direction valid.
[ ] Tidak ada circular dependency.
[ ] Public API valid.
[ ] Boundary subsystem tetap jelas.


CONFIGURATION

[ ] loadConfig() sudah diperiksa jika perubahan menyangkut
    dependency/configuration.
[ ] config/config.yml sudah diperiksa.
[ ] Tidak ada duplicate config loader.
[ ] Configuration lifecycle tetap valid.
[ ] Tidak ada asumsi dependency berdasarkan parameter saja.


CODE

[ ] Tidak ada unused import.
[ ] Tidak ada unused function.
[ ] Tidak ada unused variable.
[ ] Tidak ada duplicate implementation.
[ ] Tidak ada dead code.
[ ] Naming konsisten.


INITIALIZATION

[ ] Startup order valid.
[ ] Initialization berada di boundary yang benar.
[ ] Feature tidak melakukan initialization infrastructure.


DATABASE

[ ] Menggunakan database abstraction.
[ ] Tidak ada duplicate connection.
[ ] Migration tidak berisi business logic.


WHATSAPP

[ ] Event adapter tetap tipis.
[ ] Message processing melalui application layer.
[ ] Guard sebelum command execution.


COMMAND

[ ] Feature berada di command/.
[ ] Engine berada di src/command/.
[ ] Public API melalui command facade.
[ ] Tidak ada command yang menginisialisasi infrastructure.


MEDIA

[ ] Media logic reusable berada di media layer.
[ ] Temporary resources dibersihkan.
[ ] Error cleanup ditangani.


CLEANUP

[ ] Kode lama yang tidak diperlukan dihapus.
[ ] Tidak ada compatibility code tanpa consumer.
[ ] Tidak ada legacy comment yang menyesatkan.


==================================================
45. CURRENT BASELINE AUDIT FINDINGS
==================================================

Audit branch build menghasilkan beberapa cleanup yang jelas.


45.1 DEAD FUNCTION: extractText

Lokasi:

src/whatsapp/bootstrap/events.js

Function:

function extractText(message) {
    return (
        message?.conversation ??
        message?.extendedTextMessage?.text ??
        ''
    )
}

Function tidak digunakan.

Message extraction sudah menjadi responsibility serialize layer.

Action:

DELETE

Reason:

Dead code dan duplicate responsibility.


45.2 UNUSED IMPORT IN SENDER

Lokasi:

src/utils/serialize/sender.js

Import:

import { logger } from "#utils/terminal"

Jika tidak digunakan:

DELETE

Reason:

Unused import.


45.3 prosesMessage

Current naming:

prosesMessage

Target:

processMessage

Rename harus dilakukan pada:

- definition;
- import;
- invocation;
- export;
- consumer.

Reason:

Project naming convention menggunakan Bahasa Inggris.


45.4 APPLICATION FACADE

Current:

src/whatsapp/app/index.js

berisi implementation processMessage.

Target:

src/whatsapp/app/
├── index.js
└── processMessage.js

index.js menjadi public facade.


45.5 BOOTSTRAP SYSTEM NAMING

Current:

src/whatsapp/bootstrap/system.js

Jika hanya berisi system information:

Target:

src/whatsapp/bootstrap/systemInfo.js

Reason:

Menghindari ambiguity dengan src/utils/system/.

Priority:

P2.


45.6 LOGGER AUDIT

Terdapat:

src/utils/terminal/logger.js
src/utils/system/systemLogger.js

Jangan langsung merge.

Audit consumer dan responsibility terlebih dahulu.


45.7 CONFIGURATION DEPENDENCY AUDIT

Dependency seperti:

lang
bot
configuration

tidak boleh dianggap missing hanya karena tidak terlihat
pada parameter function.

Sebelum refactor:

inspect loadConfig()
inspect config.yml
inspect runtime context
inspect command executor
inspect consumer

Status:

AUDIT REQUIRED

Bukan automatic architecture violation.


==================================================
46. ARCHITECTURE DECISION RULES
==================================================

Jika terdapat beberapa solusi valid, prioritaskan:

1. Correctness
2. Architectural consistency
3. Maintainability
4. Simplicity
5. Performance
6. Minimal scope

Performance optimization tidak boleh merusak architecture
tanpa alasan teknis yang kuat.


==================================================
47. FUTURE ARCHITECTURE CHANGES
==================================================

Jika architecture berubah secara signifikan, update
PROJECT_GUILD.md.

Minimal dokumentasikan:

Old Architecture
       ↓
Reason
       ↓
New Architecture
       ↓
Migration
       ↓
Cleanup

Dokumen harus menggambarkan architecture aktual.


==================================================
48. DEFINITION OF DONE
==================================================

Perubahan dianggap selesai apabila:

- requirement terpenuhi;
- code bekerja;
- architecture boundary tetap valid;
- dependency direction tetap sehat;
- configuration flow tetap valid;
- tidak ada circular dependency;
- naming konsisten;
- tidak ada dead code baru;
- kode lama yang tidak diperlukan telah dibersihkan;
- initialization lifecycle valid;
- error handling memadai;
- consumer/public API telah diperiksa;
- dokumentasi diperbarui jika architecture berubah.


==================================================
49. FINAL RULE
==================================================

KureBot-Zapo harus berkembang secara modular, eksplisit,
konsisten, dan mudah dirawat.

Feature baru harus mengikuti architecture yang ada sebelum
memperkenalkan architecture baru.

AI wajib memeriksa implementasi aktual sebelum membuat
kesimpulan architectural.

Khusus dependency configuration, AI wajib memeriksa
loadConfig() dan config/config.yml sebelum menyimpulkan
bahwa dependency tidak tersedia, implicit, atau missing.

Jika sebuah perubahan membutuhkan pengecualian terhadap
aturan ini:

1. Evaluasi kebutuhan teknis.
2. Periksa dampak terhadap subsystem lain.
3. Dokumentasikan keputusan.
4. Update blueprint apabila exception menjadi bagian
   permanen architecture.


==================================================
END OF PROJECT GUILD v1.0.0
==================================================