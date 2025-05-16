# Sistema de Gestión Médica

Este es un sistema web para la gestión de pacientes y diagnósticos médicos.

## Requisitos Previos

### 1. Node.js
- Versión 14 o superior
- Descargar e instalar desde: https://nodejs.org/
- Para verificar la instalación, abra una terminal y ejecute:
  ```bash
  node --version
  ```

### 2. MariaDB
- Versión 10.5 o superior
- Descargar e instalar desde: https://mariadb.org/download/
- Durante la instalación:
  - Anote la contraseña del usuario root
  - Asegúrese de que el servicio MariaDB se inicie automáticamente

### 3. HeidiSQL
- Descargar e instalar desde: https://www.heidisql.com/download.php
- HeidiSQL es una herramienta gratuita para gestionar bases de datos MariaDB/MySQL

### 4. Configuración de la Base de Datos
1. Abra HeidiSQL
2. Cree una nueva sesión:
   - Nombre de la sesión: MariaDB
   - Red: MySQL (TCP/IP)
   - Hostname: localhost
   - Usuario: root
   - Contraseña: (la que configuró durante la instalación de MariaDB)
   - Puerto: 3306

3. Importe la base de datos:
   - Conéctese a la sesión creada
   - Haga clic en "Archivo" > "Ejecutar archivo SQL..."
   - Seleccione el archivo `BDmedico.sql`
   - Haga clic en "Abrir"

4. Verifique la importación:
   - En el panel izquierdo, debería ver la base de datos `bdmedico`
   - Expanda la base de datos para ver las tablas

## Instalación Rápida (Windows)

1. Descargue o clone este repositorio
2. Ejecute el archivo `instalar.bat`
3. Siga las instrucciones en pantalla

## Instalación Manual

1. Clone el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd bdmedico-web
   ```

2. Instale las dependencias:
   ```bash
   npm install
   ```

3. Configure la base de datos:
   - Abra `config.js`
   - Modifique las credenciales según su configuración de MariaDB:
     ```javascript
     database: {
         host: 'localhost',
         user: 'root',
         password: 'su_contraseña_de_mariadb',
         database: 'bdmedico'
     }
     ```

4. Inicie el servidor:
   ```bash
   npm start
   ```

5. Abra su navegador en `http://localhost:3000`

## Solución de Problemas

### Error de Conexión a MariaDB
- Verifique que el servicio de MariaDB esté corriendo:
  - Abra el Administrador de Servicios de Windows
  - Busque "MariaDB" y asegúrese de que esté en estado "En ejecución"
- Compruebe las credenciales en `config.js`
- Asegúrese de que la base de datos `bdmedico` existe en HeidiSQL

### Error al Iniciar el Servidor
- Verifique que el puerto 3000 no esté en uso
- Asegúrese de que todas las dependencias estén instaladas
- Revise los logs de error en la consola

### Error al Cargar la Página
- Verifique que el servidor esté corriendo
- Limpie la caché del navegador
- Revise la consola del navegador para errores

## Características

- Gestión completa de pacientes (CRUD)
- Gestión de diagnósticos médicos (CRUD)
- Validación de datos
- Manejo de errores y excepciones
- Interfaz de usuario intuitiva y responsiva

## Manejo de Errores

El sistema maneja los siguientes tipos de errores:

- Violación de clave primaria
- Violación de tipo de dato
- Violación de campos obligatorios
- Violación de restricciones de integridad referencial
- Intentos de modificar campos Identity
- Errores de conexión a la base de datos

## Tecnologías Utilizadas

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Bootstrap 5

- Backend:
  - Node.js
  - Express.js
  - MariaDB/MySQL
  - Express Validator

## Estructura del Proyecto

```
bdmedico-web/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js
├── config.js
├── instalar.bat
├── package.json
└── README.md
``` 