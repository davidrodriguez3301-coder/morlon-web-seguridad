-- =============================================
-- BASE DE DATOS COMPLETA: MORLON SEGURIDAD
-- (Versión consolidada y organizada por secciones)
-- =============================================

/* ============================================================
🔧 CREACIÓN DE BASE DE DATOS
============================================================ */

CREATE DATABASE bd_morlon_proyecto;
GO
ALTER DATABASE bd_morlon_proyecto SET MULTI_USER;
GO
USE bd_morlon_proyecto;
GO








/* ============================================================
📘 SECCIÓN 1: ZONAS
============================================================ */
IF OBJECT_ID(N'dbo.Zonas', N'U') IS NOT NULL DROP TABLE dbo.Zonas;
GO
CREATE TABLE dbo.Zonas (
    IdZonas CHAR(10) NOT NULL PRIMARY KEY,
    nombre_zona VARCHAR(30) NOT NULL
);
GO

-- =============================================
-- 🟢 INSERTAR ZONA (con validación)
-- =============================================
CREATE OR ALTER PROCEDURE SP_INSERTAR_Zonas
    @nombre_zona VARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NuevoId CHAR(10);

    -- Obtener el número más alto actual después de la letra Z
    SELECT @NuevoId = 'Z' + CAST(ISNULL(MAX(CAST(REPLACE(IdZonas, 'Z', '') AS INT)), 0) + 1 AS VARCHAR(5))
    FROM Zonas;

    -- Insertar la nueva zona con el nuevo ID
    INSERT INTO Zonas (IdZonas, nombre_zona)
    VALUES (@NuevoId, @nombre_zona);

    -- Devolver el nuevo ID generado
    SELECT @NuevoId AS idGenerado;
END;
GO



-- =============================================
-- 🟡 ACTUALIZAR ZONA (con validación)
-- =============================================
CREATE OR ALTER PROCEDURE SP_ACTUALIZAR_Zonas
    @IdZonas CHAR(10),
    @nombre_zona VARCHAR(30)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Zonas WHERE IdZonas = @IdZonas)
    BEGIN
        RAISERROR('No existe una zona con este ID.', 16, 1);
        RETURN;
    END

    UPDATE Zonas
    SET nombre_zona = @nombre_zona
    WHERE IdZonas = @IdZonas;
END;
GO

-- =============================================
-- 🔴 ELIMINAR ZONA (con validación)
-- =============================================
CREATE OR ALTER PROCEDURE SP_ELIMINAR_Zonas
    @IdZonas CHAR(10)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Zonas WHERE IdZonas = @IdZonas)
    BEGIN
        RAISERROR('No se puede eliminar: la zona no existe.', 16, 1);
        RETURN;
    END

    DELETE FROM Zonas WHERE IdZonas = @IdZonas;
END;
GO

-- =============================================
-- 🔍 OBTENER UNA ZONA
-- =============================================
CREATE OR ALTER PROCEDURE Obtener_Zonas
    @IdZonas CHAR(10)
AS
BEGIN
    SELECT IdZonas, nombre_zona
    FROM Zonas
    WHERE IdZonas = @IdZonas;
END;
GO

-- =============================================
-- 📋 LISTAR TODAS LAS ZONAS
-- =============================================
CREATE OR ALTER PROCEDURE listar_Zonas
AS
BEGIN
    SELECT IdZonas, nombre_zona
    FROM Zonas
    ORDER BY IdZonas;
END;
GO
execute listar_Zonas;

/* ============================================================
🏥 SECCIÓN 2: EPS
============================================================ */

/* ============================================================
🏥 MÓDULO EPS — ESTRUCTURA FINAL
Proyecto: MORLON SEGURIDAD
Descripción:
Módulo maestro para gestionar las Entidades Promotoras de Salud (EPS).
Este módulo usa IDs automáticos y eliminación física (sin estado lógico).
============================================================ */


IF OBJECT_ID(N'dbo.EPS', N'U') IS NOT NULL DROP TABLE dbo.EPS;
GO

CREATE TABLE dbo.EPS (
    idEPS INT IDENTITY(1,1) PRIMARY KEY,
    nombre_eps VARCHAR(50) NOT NULL UNIQUE,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE()
);
GO


/* ============================================================
🟢 PROCEDIMIENTO: SP_INSERTAR_EPS
---------------------------------------------------------------
Inserta una nueva EPS, validando que no exista previamente.
Devuelve el ID generado automáticamente.
============================================================ */
CREATE OR ALTER PROCEDURE SP_INSERTAR_EPS
    @nombre_eps VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM EPS
        WHERE LOWER(RTRIM(LTRIM(nombre_eps))) = LOWER(RTRIM(LTRIM(@nombre_eps)))
    )
    BEGIN
        RAISERROR('Ya existe una EPS con este nombre.', 16, 1);
        RETURN;
    END

    INSERT INTO EPS (nombre_eps)
    VALUES (@nombre_eps);

    SELECT SCOPE_IDENTITY() AS idGenerado;
END;
GO


/* ============================================================
🟡 PROCEDIMIENTO: SP_ACTUALIZAR_EPS
---------------------------------------------------------------
Actualiza el nombre de una EPS existente según su ID.
============================================================ */
CREATE OR ALTER PROCEDURE SP_ACTUALIZAR_EPS
    @idEPS INT,
    @nombre_eps VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM EPS WHERE idEPS = @idEPS)
    BEGIN
        RAISERROR('No existe una EPS con ese ID.', 16, 1);
        RETURN;
    END

    UPDATE EPS
    SET nombre_eps = @nombre_eps
    WHERE idEPS = @idEPS;
END;
GO


/* ============================================================
🔴 PROCEDIMIENTO: SP_ELIMINAR_EPS
---------------------------------------------------------------
Elimina una EPS de forma definitiva (no lógica).
============================================================ */
CREATE OR ALTER PROCEDURE SP_ELIMINAR_EPS
    @idEPS INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM EPS WHERE idEPS = @idEPS)
    BEGIN
        RAISERROR('La EPS no existe.', 16, 1);
        RETURN;
    END

    DELETE FROM EPS WHERE idEPS = @idEPS;
END;
GO


/* ============================================================
📋 PROCEDIMIENTO: USP_LISTAR_EPS
---------------------------------------------------------------
Devuelve la lista completa de EPS registradas en el sistema,
ordenadas por su ID ascendente.
============================================================ */
CREATE OR ALTER PROCEDURE USP_LISTAR_EPS
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        idEPS,
        nombre_eps,
        fecha_creacion
    FROM EPS
    ORDER BY idEPS;
END;
GO

execute USP_LISTAR_EPS;

/* ============================================================
🏥 SECCIÓN 3: ARL — ESTRUCTURA FINAL
============================================================ */

IF OBJECT_ID(N'dbo.ARL', N'U') IS NOT NULL DROP TABLE dbo.ARL;
GO

CREATE TABLE dbo.ARL (
    idARL INT IDENTITY(1,1) PRIMARY KEY,
    nombre_arl VARCHAR(50) NOT NULL UNIQUE,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE()
);
GO

/* ============================================================
🟢 PROCEDIMIENTO: SP_INSERTAR_ARL
---------------------------------------------------------------
Valida que no exista antes de insertar.
============================================================ */
CREATE OR ALTER PROCEDURE SP_INSERTAR_ARL
    @nombre_arl VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM ARL WHERE LOWER(RTRIM(LTRIM(nombre_arl))) = LOWER(RTRIM(LTRIM(@nombre_arl))))
    BEGIN
        RAISERROR('Ya existe una ARL con este nombre.', 16, 1);
        RETURN;
    END

    INSERT INTO ARL (nombre_arl)
    VALUES (@nombre_arl);

    SELECT SCOPE_IDENTITY() AS idGenerado;
END;
GO

/* ============================================================
🟡 PROCEDIMIENTO: SP_ACTUALIZAR_ARL
============================================================ */
CREATE OR ALTER PROCEDURE SP_ACTUALIZAR_ARL
    @idARL INT,
    @nombre_arl VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM ARL WHERE idARL = @idARL)
    BEGIN
        RAISERROR('No existe una ARL con ese ID.', 16, 1);
        RETURN;
    END

    UPDATE ARL
    SET nombre_arl = @nombre_arl
    WHERE idARL = @idARL;
END;
GO

/* ============================================================
🔴 PROCEDIMIENTO: SP_ELIMINAR_ARL
============================================================ */
CREATE OR ALTER PROCEDURE SP_ELIMINAR_ARL
    @idARL INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM ARL WHERE idARL = @idARL)
    BEGIN
        RAISERROR('La ARL no existe.', 16, 1);
        RETURN;
    END

    DELETE FROM ARL WHERE idARL = @idARL;
END;
GO

/* ============================================================
📋 PROCEDIMIENTO: USP_LISTAR_ARL
============================================================ */
CREATE OR ALTER PROCEDURE USP_LISTAR_ARL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT idARL, nombre_arl, fecha_creacion
    FROM ARL
    ORDER BY idARL ASC;
END;
GO




/* ============================================================
🏢 SECCIÓN 4: CLIENTE
============================================================ */
/* ============================================================
🏢 MÓDULO CLIENTE — ESTRUCTURA FINAL
Proyecto: MORLON SEGURIDAD
Descripción:
Módulo maestro para gestionar los clientes asignados a zonas.
Incluye generación automática del código Cliente (IDC###)
y relaciones con la tabla Zonas.
============================================================ */

-- ============================================================
-- 🧱 TABLA: CLIENTE
-- ============================================================
IF OBJECT_ID(N'dbo.Cliente', N'U') IS NOT NULL DROP TABLE dbo.Cliente;
GO

CREATE TABLE dbo.Cliente (
    idCliente CHAR(10) NOT NULL PRIMARY KEY,  -- Ej: IDC001
    nombre_cliente VARCHAR(50) NOT NULL,
    contacto VARCHAR(20) NOT NULL,
    direccion VARCHAR(50) NOT NULL,
    radio VARCHAR(20) NOT NULL,
    codigo_omega VARCHAR(20) NOT NULL,
    servicio VARCHAR(20) NOT NULL,  -- Ej: Diurno, Nocturno, Portería...
    jornada VARCHAR(20) NOT NULL,   -- Ej: 24H, 12H, 8H
    IdZonas CHAR(10) NOT NULL,
    FOREIGN KEY (IdZonas) REFERENCES Zonas(IdZonas)
);
GO


/* ============================================================
🟢 PROCEDIMIENTO: SP_INSERTAR_Cliente
---------------------------------------------------------------
Genera automáticamente un nuevo ID de Cliente con prefijo "IDC"
y lo inserta con sus datos relacionados a la zona.
============================================================ */
CREATE OR ALTER PROCEDURE SP_INSERTAR_Cliente
    @nombre_cliente VARCHAR(50),
    @contacto VARCHAR(20),
    @direccion VARCHAR(50),
    @radio VARCHAR(20),
    @codigo_omega VARCHAR(20),
    @servicio VARCHAR(20),
    @jornada VARCHAR(20),
    @IdZonas CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @nuevoId CHAR(10);

    -- Genera el nuevo código IDC###
    SELECT @nuevoId = 'IDC' + RIGHT('000' + CAST(ISNULL(MAX(CAST(SUBSTRING(idCliente, 4, LEN(idCliente)) AS INT)), 0) + 1 AS VARCHAR(3)), 3)
    FROM Cliente;

    -- Inserta el nuevo registro
    INSERT INTO Cliente (idCliente, nombre_cliente, contacto, direccion, radio, codigo_omega, servicio, jornada, IdZonas)
    VALUES (@nuevoId, @nombre_cliente, @contacto, @direccion, @radio, @codigo_omega, @servicio, @jornada, @IdZonas);

    -- Devuelve el nuevo ID creado
    SELECT @nuevoId AS idClienteCreado;
END;
GO


/* ============================================================
🟡 PROCEDIMIENTO: SP_ACTUALIZAR_Cliente
---------------------------------------------------------------
Actualiza los datos de un cliente existente según su ID.
============================================================ */
CREATE OR ALTER PROCEDURE SP_ACTUALIZAR_Cliente
    @idCliente CHAR(10),
    @nombre_cliente VARCHAR(50),
    @contacto VARCHAR(20),
    @direccion VARCHAR(50),
    @radio VARCHAR(20),
    @codigo_omega VARCHAR(20),
    @servicio VARCHAR(20),
    @jornada VARCHAR(20),
    @IdZonas CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Cliente
    SET nombre_cliente = @nombre_cliente,
        contacto = @contacto,
        direccion = @direccion,
        radio = @radio,
        codigo_omega = @codigo_omega,
        servicio = @servicio,
        jornada = @jornada,
        IdZonas = @IdZonas
    WHERE idCliente = @idCliente;
END;
GO


/* ============================================================
🔴 PROCEDIMIENTO: SP_ELIMINAR_Cliente
---------------------------------------------------------------
Elimina un cliente del sistema según su ID.
============================================================ */
CREATE OR ALTER PROCEDURE SP_ELIMINAR_Cliente
    @idCliente CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM Cliente WHERE idCliente = @idCliente;
END;
GO


/* ============================================================
📋 PROCEDIMIENTO: Obtener_Cliente
---------------------------------------------------------------
Devuelve la información de un cliente específico,
incluyendo su zona relacionada.
============================================================ */
CREATE OR ALTER PROCEDURE Obtener_Cliente
    @idCliente CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        C.idCliente,
        C.nombre_cliente,
        C.contacto,
        C.direccion,
        C.radio,
        C.codigo_omega,
        C.servicio,
        C.jornada,
        C.IdZonas,
        Z.nombre_zona AS Zona   -- 👈 cambio aquí
    FROM Cliente C
    INNER JOIN Zonas Z ON C.IdZonas = Z.IdZonas
    WHERE C.idCliente = @idCliente;
END;
GO


/* ============================================================
📋 PROCEDIMIENTO: listar_Cliente
---------------------------------------------------------------
Lista todos los clientes registrados con su zona correspondiente.
============================================================ */
CREATE OR ALTER PROCEDURE listar_Cliente
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        C.idCliente,
        C.nombre_cliente,
        C.contacto,
        C.direccion,
        C.radio,
        C.codigo_omega,
        C.servicio,
        C.jornada,
        C.IdZonas,
        Z.nombre_zona AS Zona   -- 👈 cambio aquí también
    FROM Cliente C
    INNER JOIN Zonas Z ON C.IdZonas = Z.IdZonas
    ORDER BY C.idCliente;
END;
GO




/* ============================================================
📋 SECCIÓN 5: TipoContrato
============================================================ */
IF OBJECT_ID(N'dbo.TipoContrato', N'U') IS NOT NULL DROP TABLE dbo.TipoContrato;
GO

CREATE TABLE dbo.TipoContrato (
    idTipoContrato INT IDENTITY(1,1) PRIMARY KEY,
    nombreTipo VARCHAR(30) NOT NULL UNIQUE
);
GO

/* Insertar valores iniciales */
INSERT INTO TipoContrato (nombreTipo) VALUES 
('Fijo'),
('Relevante');
GO


/* ============================================================
👷 SECCIÓN 6: OPERATIVO
============================================================ */
IF OBJECT_ID(N'dbo.Operativo', N'U') IS NOT NULL DROP TABLE dbo.Operativo;
GO
CREATE TABLE Operativo (
    codOperativo   VARCHAR(15)  NOT NULL PRIMARY KEY,   -- Código del usuario
    nombreOperativo NVARCHAR(30) NOT NULL,              -- Nombre del operativo
    contrasena      VARCHAR(200) NOT NULL,             -- Contraseña (puede ampliarse más)
    tipo_usuario    NVARCHAR(30) NOT NULL               -- Rol del usuario
);
GO

/* ============================================================
   👮 OPERATIVO DEFAULT (OPP0000)
   ============================================================ */

IF NOT EXISTS (SELECT 1 FROM Operativo WHERE codOperativo = 'OP0000')
BEGIN
    INSERT INTO Operativo (
        codOperativo,
        nombreOperativo,
        contrasena,
        tipo_usuario
    )
    VALUES (
        'OP0000',
        'OPERATIVO GENERAL',
        '1234',      -- puedes cambiar la clave
        'OPERATIVO'    -- o el rol que uses
    );
END
GO


-- ---------------------------------SP para insertar 
CREATE OR ALTER PROCEDURE SP_INSERTAR_Operativo
    @codOperativo    VARCHAR(15),
    @nombreOperativo NVARCHAR(30),
    @contrasena      VARCHAR(200),   -- Contraseña ya hasheada
    @tipo_usuario    NVARCHAR(30)
AS
BEGIN
    SET NOCOUNT OFF;

    ---------------------------------------------------------
    -- 1️⃣ VALIDAR CAMPOS OBLIGATORIOS
    ---------------------------------------------------------
    IF LTRIM(RTRIM(ISNULL(@codOperativo, ''))) = ''
        RETURN 2; -- Campos vacíos

    IF LTRIM(RTRIM(ISNULL(@nombreOperativo, ''))) = ''
        RETURN 2;

    IF LTRIM(RTRIM(ISNULL(@contrasena, ''))) = ''
        RETURN 2;

    IF LTRIM(RTRIM(ISNULL(@tipo_usuario, ''))) = ''
        RETURN 2;

    ---------------------------------------------------------
    -- 2️⃣ VALIDAR DUPLICADO (codOperativo único)
    ---------------------------------------------------------
    IF EXISTS (SELECT 1 FROM Operativo WHERE codOperativo = @codOperativo)
        RETURN 3; -- Código duplicado

    ---------------------------------------------------------
    -- 3️⃣ INSERTAR REGISTRO
    ---------------------------------------------------------
    INSERT INTO Operativo (codOperativo, nombreOperativo, contrasena, tipo_usuario)
    VALUES (
        LTRIM(RTRIM(@codOperativo)),
        LTRIM(RTRIM(@nombreOperativo)),
        LTRIM(RTRIM(@contrasena)),
        LTRIM(RTRIM(@tipo_usuario))
    );

    ---------------------------------------------------------
    -- 4️⃣ ÉXITO
    ---------------------------------------------------------
    RETURN 1;
END;
GO




---------------------------------------------------------- SP para actualizar
CREATE OR ALTER PROCEDURE SP_ACTUALIZAR_Operativo
    @codOperativo    VARCHAR(15),
    @nombreOperativo NVARCHAR(30),
    @contrasena      VARCHAR(200),    -- Contraseña ya hasheada
    @tipo_usuario    NVARCHAR(30)
AS
BEGIN
    SET NOCOUNT OFF;

    ---------------------------------------------------------
    -- 1️⃣ VALIDAR CAMPOS OBLIGATORIOS
    ---------------------------------------------------------
    IF LTRIM(RTRIM(ISNULL(@codOperativo, ''))) = ''
        RETURN 2;

    IF LTRIM(RTRIM(ISNULL(@nombreOperativo, ''))) = ''
        RETURN 2;

    IF LTRIM(RTRIM(ISNULL(@contrasena, ''))) = ''
        RETURN 2;

    IF LTRIM(RTRIM(ISNULL(@tipo_usuario, ''))) = ''
        RETURN 2;

    ---------------------------------------------------------
    -- 2️⃣ VALIDAR QUE EL OPERATIVO EXISTE
    ---------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM Operativo WHERE codOperativo = @codOperativo)
        RETURN 3; -- No existe

    ---------------------------------------------------------
    -- 3️⃣ ACTUALIZAR REGISTRO
    ---------------------------------------------------------
    UPDATE Operativo
    SET 
        nombreOperativo = LTRIM(RTRIM(@nombreOperativo)),
        contrasena      = LTRIM(RTRIM(@contrasena)),
        tipo_usuario    = LTRIM(RTRIM(@tipo_usuario))
    WHERE codOperativo = @codOperativo;

    ---------------------------------------------------------
    -- 4️⃣ ÉXITO
    ---------------------------------------------------------
    RETURN 1;
END;
GO


-- ----------------------------------------------------------------SP obtener uno
CREATE OR ALTER PROCEDURE usp_obtener_Operativo
    @codOperativo VARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Operativo WHERE codOperativo = @codOperativo;
END;
GO


-- -----------------------------------------------------------------------SP listar
CREATE OR ALTER PROCEDURE usp_listar_Operativo
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Operativo ORDER BY codOperativo;
END;
GO

---------------------------------------------------------
    --SP VALIDAR OPERATIVO
---------------------------------------------------------

CREATE OR ALTER PROCEDURE sp_ValidarOperativo
    @codOperativo NVARCHAR(15),
    @hash VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT codOperativo, nombreOperativo, tipo_usuario
    FROM Operativo
    WHERE LOWER(LTRIM(RTRIM(codOperativo))) = LOWER(LTRIM(RTRIM(@codOperativo)))
      AND contrasena = @hash;
END;
GO



  ---------------------------------------------------------
  --------------------------------------------------------------  -- sp eliminar operativo
    ---------------------------------------------------------

CREATE OR ALTER PROCEDURE SP_ELIMINAR_Operativo
    @codOperativo VARCHAR(15)
AS
BEGIN
    SET NOCOUNT OFF;

    ---------------------------------------------------------
    -- VALIDAR CAMPO OBLIGATORIO
    ---------------------------------------------------------
    IF LTRIM(RTRIM(ISNULL(@codOperativo, ''))) = ''
        RETURN 2; -- Código 2 = campo vacío

    ---------------------------------------------------------
    -- VALIDAR QUE EL OPERATIVO EXISTA
    ---------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM Operativo WHERE codOperativo = @codOperativo)
        RETURN 3; -- Código 3 = no existe

    ---------------------------------------------------------
    -- NO PERMITIR ELIMINAR AL OPERATIVO GENERAL
    ---------------------------------------------------------
    IF @codOperativo = 'OP0000'
        RETURN 4; -- Código 4 = no se puede eliminar OP0000

    ---------------------------------------------------------
    -- REASIGNAR FKs A OP0000
    ---------------------------------------------------------
    UPDATE Supervisor
        SET codOperativo = 'OP0000'
        WHERE codOperativo = @codOperativo;

    UPDATE Vigilantes
        SET codOperativo = 'OP0000'
        WHERE codOperativo = @codOperativo;

    ---------------------------------------------------------
    -- ELIMINAR EL OPERATIVO
    ---------------------------------------------------------
    DELETE FROM Operativo WHERE codOperativo = @codOperativo;

    RETURN 1; -- Código 1 = eliminado correctamente
END;
GO



/* ============================================================
   👮 SECCIÓN 7: TABLA SUPERVISOR
   ------------------------------------------------------------
   Esta tabla almacena los datos de los supervisores relacionados
   con los vigilantes y la operación. Incluye relaciones con:
   - EPS
   - ARL
   - Zonas
   - Operativo
   No contiene fotografía ni tipo de contrato aquí (solo lo básico).
============================================================ */

USE bd_morlon_proyecto;
GO



IF OBJECT_ID('Supervisor','U') IS NULL
BEGIN
    CREATE TABLE Supervisor (
        idSupervisor        CHAR(6)        NOT NULL PRIMARY KEY,
        nombres_apellidos   VARCHAR(50)    NOT NULL,
        cedula              CHAR(13)       NOT NULL UNIQUE,

        idEPS               INT            NOT NULL,
        idARL               INT            NOT NULL,
        idTipoContrato      INT            NOT NULL,

        cel1                CHAR(12)       NULL,
        cel2                CHAR(12)       NULL,
        rh                  VARCHAR(5)     NULL,
        email               VARCHAR(50)    NULL,

        IdZonas             CHAR(10)       NOT NULL,
        codOperativo        VARCHAR(15)    NOT NULL,
        fotografia          VARBINARY(MAX) NULL,

        /* ============================
           🔹 AUDITORÍA DE CREACIÓN
        ============================ */
        creado_por_codigo   VARCHAR(15)    NULL,
        creado_por_nombre   VARCHAR(80)    NULL,

        /* ============================
           🔹 AUDITORÍA DE ELIMINACIÓN
        ============================ */
        eliminado_por_codigo VARCHAR(15)   NULL,
        eliminado_por_nombre VARCHAR(80)   NULL,
        fecha_eliminado      DATETIME      NULL,

        /* ============================
           🔹 ESTADO DEL REGISTRO
              Activo / Eliminado
        ============================ */
        estado VARCHAR(20) DEFAULT 'Activo',

        -- FOREIGN KEYS
        CONSTRAINT FK_Supervisor_EPS
            FOREIGN KEY (idEPS) REFERENCES EPS(idEPS),
        CONSTRAINT FK_Supervisor_ARL
            FOREIGN KEY (idARL) REFERENCES ARL(idARL),
        CONSTRAINT FK_Supervisor_TContrato
            FOREIGN KEY (idTipoContrato) REFERENCES TipoContrato(idTipoContrato),
        CONSTRAINT FK_Supervisor_Zona
            FOREIGN KEY (IdZonas) REFERENCES Zonas(IdZonas),
        CONSTRAINT FK_Supervisor_Operativo
            FOREIGN KEY (codOperativo) REFERENCES Operativo(codOperativo)
    );
END;
GO



/* ============================================================
   👮 SECCIÓN 7.1: SUPERVISOR GENERAL (SUP000)
   ------------------------------------------------------------
   Este supervisor sirve como “fallback” para reasignación
   automática cuando se elimina un supervisor real.
   Evita errores de llaves foráneas.
============================================================ */

IF NOT EXISTS (SELECT 1 FROM Supervisor WHERE idSupervisor = 'SUP000')
BEGIN
    INSERT INTO Supervisor (
        idSupervisor, nombres_apellidos, cedula,
        idEPS, idARL, idTipoContrato,
        cel1, cel2, rh, email,
        IdZonas, codOperativo, fotografia
    )
    VALUES (
        'SUP000', 'SUPERVISOR GENERAL', '0000000000000',
        1, 1, 1,
        '0000000000', '0000000000', 'O+',
        'default@morlon.com',
        'Z1', 'OP001', NULL
    );
END
GO



/* ============================================================
   👮 SECCIÓN 7.2: SP_INSERTAR_Supervisor
   ------------------------------------------------------------
   Inserta un supervisor nuevo.
   El ID no se genera automáticamente aquí, debe venir del backend.
   Esta versión está alineada con tu estructura original corregida.
============================================================ */
CREATE OR ALTER PROCEDURE SP_INSERTAR_Superviso
    @nombres_apellidos VARCHAR(50),
    @cedula            CHAR(13),
    @idEPS             INT,
    @idARL             INT,
    @idTipoContrato    INT,
    @cel1              CHAR(12) = NULL,
    @cel2              CHAR(12) = NULL,
    @rh                VARCHAR(5) = NULL,
    @correo            VARCHAR(50) = NULL,
    @IdZonas           CHAR(10),
    @codOperativo      VARCHAR(15),
    @fotografia        VARBINARY(MAX) = NULL,

    -- 🆕 CAMPOS DE AUDITORÍA
    @creado_por_codigo VARCHAR(15) = NULL,
    @creado_por_nombre VARCHAR(80) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @idSupervisor CHAR(6);

    DECLARE @tmp TABLE (nuevoID CHAR(6));
    INSERT INTO @tmp EXEC usp_generar_idSupervisor;
    SELECT @idSupervisor = nuevoID FROM @tmp;

    INSERT INTO Supervisor (
        idSupervisor, nombres_apellidos, cedula,
        idEPS, idARL, idTipoContrato,
        cel1, cel2, rh, email,
        IdZonas, codOperativo, fotografia,

        -- Nuevos campos
        creado_por_codigo, creado_por_nombre
    )
    VALUES (
        @idSupervisor,
        LTRIM(RTRIM(@nombres_apellidos)),
        LTRIM(RTRIM(@cedula)),
        @idEPS, @idARL, @idTipoContrato,
        LTRIM(RTRIM(@cel1)),
        LTRIM(RTRIM(@cel2)),
        LTRIM(RTRIM(@rh)),
        LTRIM(RTRIM(@correo)),
        LTRIM(RTRIM(@IdZonas)),
        LTRIM(RTRIM(@codOperativo)),
        @fotografia,

        -- Auditoría real
        LTRIM(RTRIM(@creado_por_codigo)),
        LTRIM(RTRIM(@creado_por_nombre))
    );

    SELECT @idSupervisor AS nuevoID;
END;
GO



/* ============================================================
   👮 SECCIÓN 7.3: SP_ACTUALIZAR_Supervisor
   ------------------------------------------------------------
   Actualiza un supervisor existente.
   - NO BORRA campos cuando los parámetros vienen NULL.
   - Mantiene consistencia de FKs y datos críticos.
============================================================ */

CREATE OR ALTER PROCEDURE SP_ACTUALIZAR_Supervisor
    @idSupervisor     CHAR(6),
    @nombres_apellidos VARCHAR(50),
    @cedula            CHAR(13),
    @idEPS             INT = NULL,
    @idARL             INT = NULL,
    @idTipoContrato    INT = NULL,
    @cel1              CHAR(12) = NULL,
    @cel2              CHAR(12) = NULL,
    @rh                VARCHAR(5) = NULL,
    @correo            VARCHAR(50) = NULL,
    @IdZonas           CHAR(10) = NULL,
    @codOperativo      VARCHAR(15) = NULL,
    @fotografia        VARBINARY(MAX) = NULL
AS
BEGIN
    UPDATE Supervisor
    SET 
        nombres_apellidos = @nombres_apellidos,
        cedula = @cedula,

        idEPS = ISNULL(@idEPS, idEPS),
        idARL = ISNULL(@idARL, idARL),
        idTipoContrato = ISNULL(@idTipoContrato, idTipoContrato),

        cel1 = ISNULL(@cel1, cel1),
        cel2 = ISNULL(@cel2, cel2),
        rh = ISNULL(@rh, rh),
        email = ISNULL(@correo, email),

        IdZonas = ISNULL(@IdZonas, IdZonas),
        codOperativo = ISNULL(@codOperativo, codOperativo),

        fotografia = ISNULL(@fotografia, fotografia)

        -- ⚠ NO TOCAR:
        -- creado_por_codigo
        -- creado_por_nombre
    WHERE idSupervisor = @idSupervisor;
END;
GO





/* ============================================================
   👮 SECCIÓN 7.4: SP_ELIMINAR_Supervisor
   ------------------------------------------------------------
   Elimina un supervisor.
   - Evita eliminar SUP000.
   - Antes de eliminar, reasigna vigilantes a SUP000.
============================================================ */



CREATE OR ALTER PROCEDURE SP_ELIMINAR_Superviso
    @idSupervisor CHAR(6),
    @usuario_codigo VARCHAR(15),
    @usuario_nombre VARCHAR(80)
AS
BEGIN
    SET NOCOUNT ON;

    IF @idSupervisor = 'SUP000'
        RETURN;

    UPDATE Supervisor
    SET 
        estado = 'Eliminado',
        eliminado_por_codigo = @usuario_codigo,
        eliminado_por_nombre = @usuario_nombre,
        fecha_eliminado = GETDATE()
    WHERE idSupervisor = @idSupervisor;

    UPDATE Vigilantes
    SET idSupervisor = 'SUP000'
    WHERE idSupervisor = @idSupervisor;
END;
GO

SELECT idSupervisor, estado
FROM Supervisor
WHERE idSupervisor='SUP006'



/* ============================================================
   👮 SECCIÓN 7.5: usp_obtener_Supervisor
   ------------------------------------------------------------
   Devuelve un supervisor específico.
============================================================ */
CREATE OR ALTER PROCEDURE usp_obtener_Supervisor
    @idSupervisor CHAR(6)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        s.idSupervisor,
        s.nombres_apellidos,
        s.cedula,

        s.idEPS, e.nombre_eps AS nombreEPS,
        s.idARL, a.nombre_arl AS nombreARL,
        s.idTipoContrato, t.nombreTipo AS nombreTipoContrato,

        s.cel1, s.cel2,
        s.rh,
        s.email,

        s.IdZonas,
        z.nombre_zona AS nombreZona,

        s.codOperativo,
        s.fotografia,

        -- 🆕 NUEVOS CAMPOS
        s.creado_por_codigo,
        s.creado_por_nombre

    FROM Supervisor s
        LEFT JOIN EPS e ON e.idEPS = s.idEPS
        LEFT JOIN ARL a ON a.idARL = s.idARL
        LEFT JOIN TipoContrato t ON t.idTipoContrato = s.idTipoContrato
        LEFT JOIN Zonas z ON z.IdZonas = s.IdZonas
    WHERE s.idSupervisor = @idSupervisor;
END;
GO





/* ============================================================
   👮 SECCIÓN 7.6: usp_listar_Supervisor
   ------------------------------------------------------------
   Lista todos los supervisores ordenados por nombre.
============================================================ */

CREATE OR ALTER PROCEDURE usp_listar_Supervisor
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        s.idSupervisor,
        s.nombres_apellidos,
        s.cedula,
        s.idEPS,
        s.idARL,
        s.idTipoContrato,
        s.cel1,
        s.cel2,
        s.rh,
        s.email,
        s.IdZonas,
        s.codOperativo,
        s.fotografia,
        s.creado_por_codigo,
        s.creado_por_nombre,
        s.estado,
        s.eliminado_por_codigo,
        s.eliminado_por_nombre,
        s.fecha_eliminado,

        -- Campos decorativos desde otras tablas
        e.nombre_eps        AS nombreEPS,
        a.nombre_arl        AS nombreARL,
        tc.nombreTipo       AS nombreTipoContrato,
        z.nombre_zona       AS nombreZona

    FROM Supervisor s
    LEFT JOIN EPS e 
        ON e.idEPS = s.idEPS
    LEFT JOIN ARL a 
        ON a.idARL = s.idARL
    LEFT JOIN TipoContrato tc 
        ON tc.idTipoContrato = s.idTipoContrato
    LEFT JOIN Zonas z 
        ON z.IdZonas = s.IdZonas

    WHERE 
        s.estado <> 'Eliminado'  -- ocultar eliminados
        OR s.estado IS NULL       -- registros antiguos sin estado
    ORDER BY s.idSupervisor;
END;
GO


/* ============================================================
   SP: usp_listar_Supervisores_Eliminados
   Devuelve únicamente supervisores con estado = 'Eliminado'
============================================================ */

CREATE OR ALTER PROCEDURE usp_listar_Supervisores_Eliminados
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        s.idSupervisor,
        s.nombres_apellidos,
        s.cedula,
        s.idEPS,
        s.idARL,
        s.idTipoContrato,
        s.cel1,
        s.cel2,
        s.rh,
        s.email,
        s.IdZonas,
        s.codOperativo,
        s.fotografia,
        s.creado_por_codigo,
        s.creado_por_nombre,
        s.estado,
        s.eliminado_por_codigo,
        s.eliminado_por_nombre,
        s.fecha_eliminado,

        -- Campos decorativos desde otras tablas
        e.nombre_eps        AS nombreEPS,
        a.nombre_arl        AS nombreARL,
        tc.nombreTipo       AS nombreTipoContrato,
        z.nombre_zona       AS nombreZona

    FROM Supervisor s
    LEFT JOIN EPS e 
        ON e.idEPS = s.idEPS
    LEFT JOIN ARL a 
        ON a.idARL = s.idARL
    LEFT JOIN TipoContrato tc 
        ON tc.idTipoContrato = s.idTipoContrato
    LEFT JOIN Zonas z 
        ON z.IdZonas = s.IdZonas

    WHERE 
        s.estado = 'Eliminado'     -- ✔ solo eliminados
    ORDER BY 
        s.fecha_eliminado DESC;    -- los más recientes primero
END;
GO




/* ============================================================
🧍 SECCIÓN 8: VIGILANTES (Versión mejorada)
============================================================ */

IF OBJECT_ID(N'dbo.Vigilantes', N'U') IS NOT NULL 
    DROP TABLE dbo.Vigilantes;
GO

CREATE TABLE dbo.Vigilantes (
    idVigilantes CHAR(6) NOT NULL PRIMARY KEY,             -- ID autogenerado (ej: V00001)
    nombre_apellido VARCHAR(30) NOT NULL,                  -- Nombre completo
    cedula CHAR(11) NOT NULL UNIQUE,                       -- Cédula única
    idEPS INT NULL,                                        -- EPS (puede ser nulo)
    idARL INT NULL,                                        -- ARL (puede ser nulo)
    cel1 CHAR(12) NOT NULL,                                -- Teléfono principal
    cel2 CHAR(12) NULL,                                    -- Teléfono alternativo
    idTipoContrato INT NULL,                               -- 🔹 Nuevo campo: FK a TipoContrato
    rh VARCHAR(5) NOT NULL,                                -- Tipo de sangre
    email VARCHAR(50) NOT NULL,                            -- Correo
    idSupervisor CHAR(6) NOT NULL,                         -- FK Supervisor
    codOperativo VARCHAR(15) NOT NULL,                     -- FK Operativo
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo',              -- Estado del vigilante
    fotografia VARBINARY(MAX) NULL,                        -- Imagen en binario (opcional)
    
    -------------------------------------------------------
    -- 🔗 Claves foráneas
    -------------------------------------------------------
    CONSTRAINT FK_Vigilantes_EPS FOREIGN KEY (idEPS) REFERENCES EPS(idEPS),
    CONSTRAINT FK_Vigilantes_ARL FOREIGN KEY (idARL) REFERENCES ARL(idARL),
    CONSTRAINT FK_Vigilantes_Supervisor FOREIGN KEY (idSupervisor) REFERENCES Supervisor(idSupervisor),
    CONSTRAINT FK_Vigilantes_Operativo FOREIGN KEY (codOperativo) REFERENCES Operativo(codOperativo),
    CONSTRAINT FK_Vigilantes_TipoContrato FOREIGN KEY (idTipoContrato) REFERENCES TipoContrato(idTipoContrato)
);
GO

/* ============================================================
📥 SP_INSERTAR_Vigilantes (versión final con control de fotografía)
============================================================ */
IF OBJECT_ID(N'dbo.SP_INSERTAR_Vigilantes', N'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_INSERTAR_Vigilantes;
GO

CREATE PROCEDURE dbo.SP_INSERTAR_Vigilantes
    @nombre_apellido VARCHAR(30),
    @cedula CHAR(11),
    @idEPS INT = NULL,
    @idARL INT = NULL,
    @cel1 CHAR(12) = NULL,
    @cel2 CHAR(12) = NULL,
    @idTipoContrato INT = NULL,        -- ✅ FK a TipoContrato
    @rh VARCHAR(5) = NULL,
    @email VARCHAR(50) = NULL,
    @idSupervisor CHAR(6),
    @codOperativo VARCHAR(15),
    @fotografia VARBINARY(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    ------------------------------------------------------------
    -- 1️⃣ Validar duplicado por cédula
    ------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM Vigilantes WHERE LTRIM(RTRIM(cedula)) = LTRIM(RTRIM(@cedula)))
    BEGIN
        RAISERROR('Ya existe un vigilante con esta cédula.', 16, 1);
        RETURN;
    END;

    ------------------------------------------------------------
    -- 2️⃣ Generar ID automáticamente con prefijo 'V'
    ------------------------------------------------------------
    DECLARE @nuevoID CHAR(6);
    DECLARE @ultimoNumero INT;

    SELECT @ultimoNumero = ISNULL(MAX(CAST(SUBSTRING(idVigilantes, 2, 5) AS INT)), 0) + 1
    FROM Vigilantes;

    SET @nuevoID = 'V' + RIGHT('00000' + CAST(@ultimoNumero AS VARCHAR(5)), 5);

    ------------------------------------------------------------
    -- 3️⃣ Insertar nuevo registro (manejo seguro de @fotografia)
    ------------------------------------------------------------
    INSERT INTO Vigilantes (
        idVigilantes,
        nombre_apellido,
        cedula,
        idEPS,
        idARL,
        cel1,
        cel2,
        idTipoContrato,
        rh,
        email,
        idSupervisor,
        codOperativo,
        estado,
        fotografia
    )
    VALUES (
        @nuevoID,
        NULLIF(LTRIM(RTRIM(@nombre_apellido)), ''),
        NULLIF(LTRIM(RTRIM(@cedula)), ''),
        NULLIF(@idEPS, 0),
        NULLIF(@idARL, 0),
        NULLIF(LTRIM(RTRIM(@cel1)), ''),
        NULLIF(LTRIM(RTRIM(@cel2)), ''),
        @idTipoContrato,
        NULLIF(LTRIM(RTRIM(@rh)), ''),
        NULLIF(LTRIM(RTRIM(@email)), ''),
        LTRIM(RTRIM(@idSupervisor)),
        LTRIM(RTRIM(@codOperativo)),
        'Activo',
        CASE 
            WHEN @fotografia IS NOT NULL AND DATALENGTH(@fotografia) > 0 
            THEN @fotografia 
            ELSE NULL 
        END
    );

    ------------------------------------------------------------
    -- 4️⃣ Retornar el ID generado
    ------------------------------------------------------------
    SELECT @nuevoID AS idGenerado;
END;
GO




/* ============================================================
📝 SP_ACTUALIZAR_Vigilantes
============================================================ */

IF OBJECT_ID(N'dbo.SP_ACTUALIZAR_Vigilantes', N'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_ACTUALIZAR_Vigilantes;
GO

/* ============================================================
🧩 CREAR PROCEDIMIENTO ACTUALIZADO*/

/* ============================================================
🧩 SP_ACTUALIZAR_Vigilantes (versión final con idTipoContrato)
============================================================ */


CREATE PROCEDURE dbo.SP_ACTUALIZAR_Vigilantes
    @idVigilantes CHAR(6),
    @nombre_apellido VARCHAR(30),
    @cedula CHAR(11),
    @idEPS INT = NULL,
    @idARL INT = NULL,
    @cel1 CHAR(12) = NULL,
    @cel2 CHAR(12) = NULL,
    @idTipoContrato INT = NULL,          -- ✅ Nuevo parámetro correcto
    @rh VARCHAR(5) = NULL,
    @email VARCHAR(50) = NULL,
    @idSupervisor CHAR(6) = NULL,
    @codOperativo VARCHAR(15) = NULL,
    @estado CHAR(8) = 'Activo',
    @fotografia VARBINARY(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- ✅ Validar existencia del vigilante
    IF NOT EXISTS (SELECT 1 FROM Vigilantes WHERE idVigilantes = @idVigilantes)
    BEGIN
        RAISERROR('No existe un vigilante con este ID.', 16, 1);
        RETURN;
    END;

    -- ✅ Actualizar registro
    UPDATE Vigilantes
    SET 
        nombre_apellido = LTRIM(RTRIM(@nombre_apellido)),
        cedula = LTRIM(RTRIM(@cedula)),
        idEPS = @idEPS,
        idARL = @idARL,
        idTipoContrato = @idTipoContrato,
        rh = LTRIM(RTRIM(@rh)),
        email = LTRIM(RTRIM(@email)),
        idSupervisor = LTRIM(RTRIM(@idSupervisor)),
        codOperativo = LTRIM(RTRIM(@codOperativo)),
        estado = LTRIM(RTRIM(@estado)),
        cel1 = LTRIM(RTRIM(@cel1)),
        cel2 = LTRIM(RTRIM(@cel2)),
        -- 🔹 Solo actualiza la foto si el parámetro tiene datos válidos
        fotografia = CASE 
                        WHEN @fotografia IS NOT NULL AND DATALENGTH(@fotografia) > 0 
                        THEN @fotografia 
                        ELSE fotografia 
                     END
    WHERE idVigilantes = @idVigilantes;
END;
GO




/* ============================================================
📋 SP_LISTAR_VigilantesActivos
Devuelve únicamente los vigilantes con estado 'Activo'
============================================================ */
IF OBJECT_ID(N'dbo.SP_LISTAR_VigilantesActivos', N'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_LISTAR_VigilantesActivos;
GO
CREATE PROCEDURE dbo.SP_LISTAR_VigilantesActivos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        RTRIM(LTRIM(v.idVigilantes))            AS idVigilantes,
        v.nombre_apellido,
        v.cedula,
        v.cel1,
        v.cel2,
        v.rh,
        v.email,
        v.idSupervisor,
        s.nombres_apellidos                     AS nombreSupervisor,
        v.codOperativo,
        v.estado,
        v.idEPS,
        e.nombre_eps                             AS nombreEPS,
        v.idARL,
        a.nombre_arl                             AS nombreARL,
        v.idTipoContrato,
        t.nombreTipo                             AS tipo_contrato,  -- 👈 Alias compatible con tu JS
        ISNULL(DATALENGTH(v.fotografia), 0)      AS tamaño_foto,
        v.fotografia
    FROM Vigilantes v
    LEFT JOIN Supervisor   s ON s.idSupervisor    = v.idSupervisor
    LEFT JOIN EPS          e ON e.idEPS           = v.idEPS
    LEFT JOIN ARL          a ON a.idARL           = v.idARL
    LEFT JOIN TipoContrato t ON t.idTipoContrato  = v.idTipoContrato
    WHERE v.estado = 'Activo'
    ORDER BY v.idVigilantes;
END;
GO






/* ============================================================
📜 SP_LISTAR_VigilantesInactivos
Devuelve los vigilantes con estado 'Inactivo'
============================================================ */
IF OBJECT_ID(N'dbo.SP_LISTAR_VigilantesInactivos', N'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_LISTAR_VigilantesInactivos;
GO
CREATE PROCEDURE dbo.SP_LISTAR_VigilantesInactivos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        RTRIM(LTRIM(v.idVigilantes))            AS idVigilantes,
        v.nombre_apellido,
        v.cedula,
        v.cel1,
        v.cel2,
        v.rh,
        v.email,
        v.idSupervisor,
        s.nombres_apellidos                     AS nombreSupervisor,
        v.codOperativo,
        v.estado,
        v.idEPS,
        e.nombre_eps                             AS nombreEPS,
        v.idARL,
        a.nombre_arl                             AS nombreARL,
        v.idTipoContrato,
        t.nombreTipo                             AS tipo_contrato,  -- 👈 Alias compatible con tu JS
        ISNULL(DATALENGTH(v.fotografia), 0)      AS tamaño_foto,
        v.fotografia
    FROM Vigilantes v
    LEFT JOIN Supervisor   s ON s.idSupervisor    = v.idSupervisor
    LEFT JOIN EPS          e ON e.idEPS           = v.idEPS
    LEFT JOIN ARL          a ON a.idARL           = v.idARL
    LEFT JOIN TipoContrato t ON t.idTipoContrato  = v.idTipoContrato
    WHERE v.estado = 'Inactivo'
    ORDER BY v.idVigilantes;
END;
GO


/* ============================================================
📜 Obtener Vigilantes
============================================================ */
IF OBJECT_ID(N'dbo.SP_OBTENER_Vigilante', N'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_OBTENER_Vigilante;
GO
CREATE PROCEDURE dbo.SP_OBTENER_Vigilante
    @idVigilantes VARCHAR(6)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        RTRIM(LTRIM(v.idVigilantes))            AS idVigilantes,
        v.nombre_apellido,
        v.cedula,
        v.cel1,
        v.cel2,
        v.rh,
        v.email,
        v.idSupervisor,
        s.nombres_apellidos                     AS nombreSupervisor,
        v.codOperativo,
        v.estado,
        v.idEPS,
        e.nombre_eps                             AS nombreEPS,
        v.idARL,
        a.nombre_arl                             AS nombreARL,
        v.idTipoContrato,
        t.nombreTipo                             AS tipo_contrato,  -- 👈 Alias compatible con tu JS
        ISNULL(DATALENGTH(v.fotografia), 0)      AS tamaño_foto,
        v.fotografia
    FROM Vigilantes v
    LEFT JOIN Supervisor   s ON s.idSupervisor    = v.idSupervisor
    LEFT JOIN EPS          e ON e.idEPS           = v.idEPS
    LEFT JOIN ARL          a ON a.idARL           = v.idARL
    LEFT JOIN TipoContrato t ON t.idTipoContrato  = v.idTipoContrato
    WHERE v.idVigilantes = @idVigilantes;
END;
GO
/* ============================================================
📜 SP_CAMBIAR_ESTADO_Vigilantes
Cambia el estado de un vigilante (Activo/Inactivo)
============================================================ */
IF OBJECT_ID(N'dbo.SP_CAMBIAR_ESTADO_Vigilantes', N'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_CAMBIAR_ESTADO_Vigilantes;
GO
CREATE PROCEDURE dbo.SP_CAMBIAR_ESTADO_Vigilantes
    @idVigilantes CHAR(6),
    @nuevoEstado VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Vigilantes WHERE idVigilantes = @idVigilantes)
    BEGIN
        RAISERROR('No existe un vigilante con el ID especificado.', 16, 1);
        RETURN;
    END;

    UPDATE Vigilantes
    SET estado = @nuevoEstado
    WHERE idVigilantes = @idVigilantes;

    SELECT 'OK' AS resultado, @idVigilantes AS idActualizado, @nuevoEstado AS estadoNuevo;
END;
GO

/* ============================================================
🧾 SECCIÓN 9: NOVEDADES — INSTALADOR SEGURO
============================================================ */

-- Crear tabla SOLO SI NO EXISTE
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Novedades')
BEGIN
    CREATE TABLE dbo.Novedades (
        idNovedad       CHAR(6)     NOT NULL PRIMARY KEY,
        nombre_novedad  VARCHAR(50) NOT NULL,
        tipo_de_novedad VARCHAR(30) NOT NULL,
        clave_novedad   VARCHAR(20) NOT NULL
    );
END
GO

/* === SP: Insertar Novedad === */
CREATE OR ALTER PROCEDURE SP_INSERTAR_Novedades
    @idNovedad       CHAR(6),
    @nombre_novedad  VARCHAR(50),
    @tipo_de_novedad VARCHAR(30),
    @clave_novedad   VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Novedades WHERE idNovedad = @idNovedad)
    BEGIN
        RAISERROR('El idNovedad ya existe en Novedades.', 16, 1);
        RETURN;
    END

    INSERT INTO Novedades (idNovedad, nombre_novedad, tipo_de_novedad, clave_novedad)
    VALUES (@idNovedad, @nombre_novedad, @tipo_de_novedad, @clave_novedad);
END;
GO

/* === SP: Actualizar Novedad === */
CREATE OR ALTER PROCEDURE SP_ACTUALIZAR_Novedades
    @idNovedad       CHAR(6),
    @nombre_novedad  VARCHAR(50),
    @tipo_de_novedad VARCHAR(30),
    @clave_novedad   VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Novedades WHERE idNovedad = @idNovedad)
    BEGIN
        RAISERROR('La novedad con ese idNovedad no existe.', 16, 1);
        RETURN;
    END

    UPDATE Novedades
    SET nombre_novedad = @nombre_novedad,
        tipo_de_novedad = @tipo_de_novedad,
        clave_novedad = @clave_novedad
    WHERE idNovedad = @idNovedad;
END;
GO

/* === SP: Eliminar Novedad === */
CREATE OR ALTER PROCEDURE SP_ELIMINAR_Novedades
    @idNovedad CHAR(6)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Novedades WHERE idNovedad = @idNovedad)
    BEGIN
        RAISERROR('La novedad con ese idNovedad no existe.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        DELETE FROM Novedades WHERE idNovedad = @idNovedad;
    END TRY
    BEGIN CATCH
        RAISERROR('No se pudo eliminar la novedad. Puede estar referenciada.', 16, 1);
    END CATCH

END;
GO

/* === SP: Obtener Novedad === */
CREATE OR ALTER PROCEDURE SP_OBTENER_Novedades
    @idNovedad CHAR(6)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT idNovedad, nombre_novedad, tipo_de_novedad, clave_novedad
    FROM Novedades
    WHERE idNovedad = @idNovedad;
END;
GO

/* === SP: Listar Novedades === */
CREATE OR ALTER PROCEDURE SP_LISTAR_Novedades
AS
BEGIN
    SET NOCOUNT ON;

    SELECT idNovedad, nombre_novedad, tipo_de_novedad, clave_novedad
    FROM Novedades
    ORDER BY idNovedad;
END;
GO


/* ============================================================
📅 SECCIÓN 10: AGENDAMIENTO (Cabecera, Detalle, Turnos, Historial)
============================================================ */

-- Limpieza previa (si existen tablas anteriores)
IF OBJECT_ID(N'dbo.TurnoAsignado', N'U') IS NOT NULL DROP TABLE dbo.TurnoAsignado;
IF OBJECT_ID(N'dbo.DetalleAgendamiento', N'U') IS NOT NULL DROP TABLE dbo.DetalleAgendamiento;
IF OBJECT_ID(N'dbo.Agendamiento', N'U') IS NOT NULL DROP TABLE dbo.Agendamiento;
IF OBJECT_ID(N'dbo.HistorialAsignaciones', N'U') IS NOT NULL DROP TABLE dbo.HistorialAsignaciones;
GO


/* ============================================================
   🔹 TABLA: Agendamiento
   📘 Almacena los registros de programación mensual por cliente.
   ============================================================ */
IF OBJECT_ID(N'dbo.Agendamiento', N'U') IS NOT NULL DROP TABLE dbo.Agendamiento;
GO
CREATE TABLE dbo.Agendamiento (
    idAgendamiento INT IDENTITY(1,1) PRIMARY KEY,
    idCliente CHAR(10) NOT NULL,
    mes SMALLINT NOT NULL,
    anio SMALLINT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente) ON DELETE CASCADE ON UPDATE CASCADE
);
GO


/* ============================================================
   🔹 TABLA: DetalleAgendamiento
   📘 Días generados automáticamente para cada agendamiento.
   ============================================================ */
IF OBJECT_ID(N'dbo.DetalleAgendamiento', N'U') IS NOT NULL DROP TABLE dbo.DetalleAgendamiento;
GO
CREATE TABLE dbo.DetalleAgendamiento (
    idDetalle INT IDENTITY(1,1) PRIMARY KEY,
    idAgendamiento INT NOT NULL,
    fecha DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    FOREIGN KEY (idAgendamiento) REFERENCES Agendamiento(idAgendamiento) ON DELETE CASCADE ON UPDATE CASCADE
);
GO


/* ============================================================
   🔹 TABLA: TurnoAsignado
   📘 Asigna un vigilante a un día y tipo de turno específico.
   ============================================================ */
IF OBJECT_ID(N'dbo.TurnoAsignado', N'U') IS NOT NULL DROP TABLE dbo.TurnoAsignado;
GO
/*
CREATE TABLE dbo.TurnoAsignado (
    idTurno INT IDENTITY(1,1) PRIMARY KEY,
    idDetalle INT NOT NULL,
    idVigilante CHAR(6) NOT NULL,
    tipo_turno VARCHAR(20) NOT NULL,
    FOREIGN KEY (idDetalle) REFERENCES DetalleAgendamiento(idDetalle) ON DELETE CASCADE ON UPDATE CASCADE
);
GO*/

CREATE TABLE dbo.TurnoAsignado (
    idTurno INT IDENTITY(1,1) PRIMARY KEY,         -- Identificador único autoincremental
    idDetalle INT NOT NULL,                        -- Relación con DetalleAgendamiento
    idVigilante CHAR(6) NOT NULL,                  -- Relación con Vigilantes
    tipo_turno VARCHAR(20) NOT NULL,               -- Tipo de turno (Diurno, Nocturno, etc.)
    estado VARCHAR(15) NOT NULL DEFAULT 'Asignado',-- Estado actual del turno
    CONSTRAINT FK_TurnoAsignado_Detalle FOREIGN KEY (idDetalle) 
        REFERENCES DetalleAgendamiento(idDetalle) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_TurnoAsignado_Vigilante FOREIGN KEY (idVigilante) 
        REFERENCES Vigilantes(idVigilantes) 
        ON DELETE NO ACTION ON UPDATE CASCADE
);
GO


/* ============================================================
   🔹 PROCEDIMIENTO: usp_listar_AgendamientoPorCliente
   📘 Devuelve todos los agendamientos de un cliente.
   ============================================================ */
IF OBJECT_ID(N'usp_listar_AgendamientoPorCliente', N'P') IS NOT NULL
    DROP PROCEDURE usp_listar_AgendamientoPorCliente;
GO
CREATE PROCEDURE usp_listar_AgendamientoPorCliente
    @idCliente CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        idAgendamiento,
        idCliente,
        mes,
        anio,
        estado,
        fecha_creacion
    FROM Agendamiento
    WHERE idCliente = @idCliente
    ORDER BY fecha_creacion DESC;
END;
GO


/* ============================================================
   🔹 PROCEDIMIENTO: usp_listar_DetalleAgendamiento
   📘 Lista simple de días de un agendamiento sin incluir turnos.
   ============================================================ */
IF OBJECT_ID(N'usp_listar_DetalleAgendamiento', N'P') IS NOT NULL
    DROP PROCEDURE usp_listar_DetalleAgendamiento;
GO
CREATE PROCEDURE usp_listar_DetalleAgendamiento
    @idAgendamiento INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        idDetalle,
        idAgendamiento,
        fecha,
        estado
    FROM DetalleAgendamiento
    WHERE idAgendamiento = @idAgendamiento
    ORDER BY fecha;
END;
GO


/* ============================================================
   🔹 PROCEDIMIENTO: usp_listar_DetalleConTurnos (versión extendida)
   📘 Devuelve días del agendamiento junto con turnos y nombres de vigilantes.
   ============================================================ */
   IF OBJECT_ID(N'usp_listar_DetalleConTurnos', N'P') IS NOT NULL
    DROP PROCEDURE usp_listar_DetalleConTurnos;
GO

CREATE PROCEDURE usp_listar_DetalleConTurnos
    @idAgendamiento INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        d.idDetalle,
        d.idAgendamiento,
        d.fecha,
        d.estado,

        (SELECT TOP 1 t.tipo_turno 
         FROM TurnoAsignado t 
         WHERE t.idDetalle = d.idDetalle 
         ORDER BY t.idTurno ASC) AS primer_tipo_turno,

        STRING_AGG(t.tipo_turno, ', ') AS turnos_csv,

        -- 👇 unión normalizada por espacios y mayúsculas
        STRING_AGG(v.nombre_apellido, ', ') AS vigilantes_csv

    FROM DetalleAgendamiento d
    LEFT JOIN TurnoAsignado t 
        ON t.idDetalle = d.idDetalle
    LEFT JOIN Vigilantes v 
        ON LTRIM(RTRIM(LOWER(v.idVigilantes))) = LTRIM(RTRIM(LOWER(t.idVigilante)))
    WHERE d.idAgendamiento = @idAgendamiento
    GROUP BY d.idDetalle, d.idAgendamiento, d.fecha, d.estado
    ORDER BY d.fecha;
END;
GO





/* ============================================================
⚙️ PROCEDIMIENTO: SP_GENERAR_DetalleAgendamiento (versión optimizada)
---------------------------------------------------------------
Genera los días del mes solo si no existen previamente.
Usa una tabla virtual en lugar de WHILE para evitar duplicados.
============================================================ */
IF OBJECT_ID(N'SP_GENERAR_DetalleAgendamiento', N'P') IS NOT NULL
    DROP PROCEDURE SP_GENERAR_DetalleAgendamiento;
GO

CREATE PROCEDURE SP_GENERAR_DetalleAgendamiento
    @idAgendamiento INT,
    @mes INT,
    @anio INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @fechaInicio DATE = DATEFROMPARTS(@anio, @mes, 1);
    DECLARE @fechaFin DATE = EOMONTH(@fechaInicio);

    ;WITH DiasMes AS (
        SELECT @fechaInicio AS fecha
        UNION ALL
        SELECT DATEADD(DAY, 1, fecha)
        FROM DiasMes
        WHERE fecha < @fechaFin
    )
    INSERT INTO DetalleAgendamiento (idAgendamiento, fecha, estado)
    SELECT @idAgendamiento, fecha, 'Pendiente'
    FROM DiasMes
    WHERE NOT EXISTS (
        SELECT 1 FROM DetalleAgendamiento d
        WHERE d.idAgendamiento = @idAgendamiento
        AND d.fecha = DiasMes.fecha
    )
    OPTION (MAXRECURSION 1000);
END;
GO



/* ============================================================
⚙️ PROCEDIMIENTO: SP_ASIGNAR_TURNO_VIGILANTE
---------------------------------------------------------------
Asigna un vigilante y tipo de turno a un día específico.
Devuelve 1 si tuvo éxito, 0 si ocurrió error.
============================================================ */
IF OBJECT_ID(N'SP_ASIGNAR_TURNO_VIGILANTE', N'P') IS NOT NULL
    DROP PROCEDURE SP_ASIGNAR_TURNO_VIGILANTE;
GO

CREATE PROCEDURE SP_ASIGNAR_TURNO_VIGILANTE
    @idDetalle INT,
    @idVigilante CHAR(6),
    @tipo_turno VARCHAR(20)
AS
BEGIN
    -- ⚠️ IMPORTANTE: debe estar OFF para que C# reciba el SELECT
    SET NOCOUNT OFF;  

    BEGIN TRY
        IF EXISTS (
            SELECT 1 FROM TurnoAsignado 
            WHERE idDetalle = @idDetalle AND tipo_turno = @tipo_turno
        )
        BEGIN
            UPDATE TurnoAsignado
            SET idVigilante = @idVigilante, estado = 'Asignado'
            WHERE idDetalle = @idDetalle AND tipo_turno = @tipo_turno;
        END
        ELSE
        BEGIN
            INSERT INTO TurnoAsignado (idDetalle, idVigilante, tipo_turno, estado)
            VALUES (@idDetalle, @idVigilante, @tipo_turno, 'Asignado');
        END

        -- 👇 Este SELECT es lo que debe ver C#
        SELECT 1 AS Exito;
        RETURN;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Exito;
        RETURN;
    END CATCH
END;
GO



/* ============================================================
   🔹 PROCEDIMIENTO: SP_VERIFICAR_EstadoDetalle
   📘 Actualiza el estado del día según tenga o no turnos asignados.
   ============================================================ */
IF OBJECT_ID(N'SP_VERIFICAR_EstadoDetalle', N'P') IS NOT NULL
    DROP PROCEDURE SP_VERIFICAR_EstadoDetalle;
GO
CREATE PROCEDURE SP_VERIFICAR_EstadoDetalle
    @idDetalle INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @totalTurnos INT;
    SELECT @totalTurnos = COUNT(*) FROM TurnoAsignado WHERE idDetalle = @idDetalle;

    UPDATE DetalleAgendamiento
    SET estado = CASE 
                    WHEN @totalTurnos > 0 THEN 'Asignado'
                    ELSE 'Pendiente'
                 END
    WHERE idDetalle = @idDetalle;
END;
GO


/* ============================================================
   🔹 PROCEDIMIENTO: SP_VERIFICAR_Completado
   📘 Si todos los días de un agendamiento están asignados,
      marca el agendamiento como 'Completo'.
   ============================================================ */
IF OBJECT_ID(N'SP_VERIFICAR_Completado', N'P') IS NOT NULL
    DROP PROCEDURE SP_VERIFICAR_Completado;
GO
CREATE PROCEDURE SP_VERIFICAR_Completado
    @idAgendamiento INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @totalDias INT, @asignados INT;
    SELECT @totalDias = COUNT(*) FROM DetalleAgendamiento WHERE idAgendamiento = @idAgendamiento;
    SELECT @asignados = COUNT(*) FROM DetalleAgendamiento WHERE idAgendamiento = @idAgendamiento AND estado = 'Asignado';

    UPDATE Agendamiento
    SET estado = CASE 
                    WHEN @asignados = @totalDias THEN 'Completo'
                    ELSE 'Pendiente'
                 END
    WHERE idAgendamiento = @idAgendamiento;
END;
GO

/* ============================================================
   📘 TABLA: ASIGNACIÓN CLIENTE - VIGILANTES
   Descripción:
   Registra los vigilantes asignados a cada cliente, junto con
   el tipo de contrato vigente en el momento de la asignación.
   ============================================================ */
IF OBJECT_ID(N'dbo.AsignacionClienteVigilante', N'U') IS NOT NULL
    DROP TABLE dbo.AsignacionClienteVigilante;
GO

CREATE TABLE dbo.AsignacionClienteVigilante (
    idAsignacion INT IDENTITY(1,1) PRIMARY KEY,        -- Identificador único
    idCliente CHAR(10) NOT NULL,                       -- Relación con Cliente
    idVigilante CHAR(6) NOT NULL,                      -- Relación con Vigilantes
    idTipoContrato INT NULL,                           -- Contrato del vigilante al momento de la asignación
    fecha_inicio DATE NOT NULL DEFAULT GETDATE(),      -- Fecha de inicio
    fecha_fin DATE NULL,                               -- Fecha de finalización (si aplica)
    observaciones VARCHAR(200) NULL,                   -- Comentarios adicionales
    estado VARCHAR(15) NOT NULL DEFAULT 'Activo',      -- Estado de la asignación (para control interno)
    
    ------------------------------------------------------------
    -- 🔗 Relaciones (Foreign Keys)
    ------------------------------------------------------------
    CONSTRAINT FK_AsignacionCliente FOREIGN KEY (idCliente)
        REFERENCES Cliente(idCliente),

    CONSTRAINT FK_AsignacionVigilante FOREIGN KEY (idVigilante)
        REFERENCES Vigilantes(idVigilantes),

    CONSTRAINT FK_AsignacionTipoContrato FOREIGN KEY (idTipoContrato)
        REFERENCES TipoContrato(idTipoContrato)
);
GO
/* ============================================================
   📘 PROCEDIMIENTO: SP_INSERTAR_AsignacionClienteVigilante
   ------------------------------------------------------------
   ➤ Inserta una nueva relación Cliente–Vigilante.
   ➤ Evita duplicar asignaciones para vigilantes con contrato Fijo.
   ============================================================ */
IF OBJECT_ID(N'dbo.SP_INSERTAR_AsignacionClienteVigilante', N'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_INSERTAR_AsignacionClienteVigilante;
GO

CREATE PROCEDURE dbo.SP_INSERTAR_AsignacionClienteVigilante
    @idCliente       CHAR(10),
    @idVigilante     CHAR(6),
    @idTipoContrato  INT = NULL,
    @fecha_inicio    DATE = NULL,
    @fecha_fin       DATE = NULL,
    @observaciones   VARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @fecha_inicio IS NULL
        SET @fecha_inicio = GETDATE();

    DECLARE @nombreTipoContrato VARCHAR(50);
    SELECT @nombreTipoContrato = t.nombreTipo
    FROM TipoContrato t
    WHERE t.idTipoContrato = @idTipoContrato;

    -- 🚫 Si el contrato es FIJO, verificar si ya tiene una asignación activa
    IF (@nombreTipoContrato IS NOT NULL AND @nombreTipoContrato LIKE '%Fijo%')
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM AsignacionClienteVigilante
            WHERE idVigilante = @idVigilante
              AND estado = 'Activo'
              AND (fecha_fin IS NULL OR fecha_fin >= GETDATE())
        )
        BEGIN
            RAISERROR('El vigilante con contrato Fijo ya está asignado a otro cliente y no está disponible.', 16, 1);
            RETURN;
        END
    END

    INSERT INTO dbo.AsignacionClienteVigilante
        (idCliente, idVigilante, idTipoContrato, fecha_inicio, fecha_fin, observaciones, estado)
    VALUES
        (@idCliente, @idVigilante, @idTipoContrato, @fecha_inicio, @fecha_fin, @observaciones, 'Activo');

    SELECT SCOPE_IDENTITY() AS idAsignacion;
END;
GO

/* ============================================================
   📘 PROCEDIMIENTO: SP_LISTAR_AsignacionesPorCliente
   ------------------------------------------------------------
   ➤ Devuelve todas las asignaciones de vigilantes por cliente.
   ➤ Incluye tipo de contrato, fechas y observaciones.
   ============================================================ */
IF OBJECT_ID(N'dbo.SP_LISTAR_AsignacionesPorCliente', N'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_LISTAR_AsignacionesPorCliente;
GO

CREATE PROCEDURE dbo.SP_LISTAR_AsignacionesPorCliente
    @idCliente CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        a.idAsignacion,
        LTRIM(RTRIM(a.idCliente)) AS idCliente,
        LTRIM(RTRIM(c.nombre_cliente)) AS nombre_cliente,
        a.idVigilante,
        v.nombre_apellido AS nombreVigilante,
        a.idTipoContrato,
        t.nombreTipo AS tipoContrato,
        a.fecha_inicio,
        a.fecha_fin,
        a.observaciones,
        a.estado
    FROM dbo.AsignacionClienteVigilante a
    INNER JOIN dbo.Cliente c ON LTRIM(RTRIM(c.idCliente)) = LTRIM(RTRIM(a.idCliente))
    INNER JOIN dbo.Vigilantes v ON v.idVigilantes = a.idVigilante
    LEFT JOIN dbo.TipoContrato t ON t.idTipoContrato = a.idTipoContrato
    WHERE LTRIM(RTRIM(a.idCliente)) = LTRIM(RTRIM(@idCliente))
    ORDER BY a.fecha_inicio DESC;
END;
GO




/* ============================================================
🔗 SECCIÓN 11: TABLAS RELACIONALES
============================================================ */
IF OBJECT_ID(N'dbo.Supervisor_Vigilante', N'U') IS NOT NULL DROP TABLE dbo.Supervisor_Vigilante;
IF OBJECT_ID(N'dbo.Supervisor_Cliente', N'U') IS NOT NULL DROP TABLE dbo.Supervisor_Cliente;
IF OBJECT_ID(N'dbo.Vigilante_Novedad', N'U') IS NOT NULL DROP TABLE dbo.Vigilante_Novedad;
IF OBJECT_ID(N'dbo.Supervisor_Novedad', N'U') IS NOT NULL DROP TABLE dbo.Supervisor_Novedad;
GO

CREATE TABLE dbo.Supervisor_Vigilante (
    idSupervisor CHAR(6) NOT NULL,
    idVigilante CHAR(6) NOT NULL,
    FOREIGN KEY (idSupervisor) REFERENCES dbo.Supervisor(idSupervisor),
    FOREIGN KEY (idVigilante) REFERENCES dbo.Vigilantes(idVigilantes)
);
GO

CREATE TABLE dbo.Supervisor_Cliente (
    idSupervisor CHAR(6) NOT NULL,
    idCliente CHAR(10) NOT NULL,
    FOREIGN KEY (idSupervisor) REFERENCES dbo.Supervisor(idSupervisor),
    FOREIGN KEY (idCliente) REFERENCES dbo.Cliente(idCliente)
);
GO

CREATE TABLE dbo.Vigilante_Novedad (
    idVigilante CHAR(6) NOT NULL,
    idNovedad CHAR(6) NOT NULL,
    FOREIGN KEY (idVigilante) REFERENCES dbo.Vigilantes(idVigilantes),
    FOREIGN KEY (idNovedad) REFERENCES dbo.Novedades(idNovedad)
);
GO

CREATE TABLE dbo.Supervisor_Novedad (
    idSupervisor CHAR(6) NOT NULL,
    idNovedad CHAR(6) NOT NULL,
    FOREIGN KEY (idSupervisor) REFERENCES dbo.Supervisor(idSupervisor),
    FOREIGN KEY (idNovedad) REFERENCES dbo.Novedades(idNovedad)
);
GO



-- =============================================
-- VIEW
-- =============================================


CREATE OR ALTER VIEW dbo.VW_Vigilantes_Detalle
AS
SELECT
    RTRIM(LTRIM(v.idVigilantes))           AS idVigilantes,
    v.nombre_apellido,
    v.cedula,
    v.idEPS,
    v.idARL,
    v.cel1,
    v.cel2,
    v.idTipoContrato,
    ISNULL(tc.nombreTipo, 'Sin definir')   AS tipo_contrato,     -- ← Texto del contrato
    v.rh,
    v.email,
    v.idSupervisor,
    ISNULL(s.nombres_apellidos, '')        AS nombreSupervisor,  -- ← Nombre del supervisor
    v.codOperativo,
    v.estado,
    DATALENGTH(v.fotografia)               AS tamaño_foto,       -- ← Tamaño (bytes)
    v.fotografia
FROM dbo.Vigilantes v
LEFT JOIN dbo.TipoContrato tc ON v.idTipoContrato = tc.idTipoContrato
LEFT JOIN dbo.Supervisor s     ON v.idSupervisor   = s.idSupervisor;
GO


/* ============================================================
   👮 SECCIÓN 12: AUDITORIAS
   ------------------------------------------------------------
   Esta tabla almacena los datos de los supervisores relacionados
   con los vigilantes y la operación. Incluye relaciones con:
   - EPS
   - ARL
   - Zonas
   - Operativo
   No contiene fotografía ni tipo de contrato aquí (solo lo básico).
============================================================ */
-- =============================================
-- AUDITORIA LOGIN
-- =============================================
CREATE TABLE AuditoriaLogin (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codOperativo VARCHAR(15),
    fecha DATETIME DEFAULT GETDATE(),
    ip VARCHAR(40),
    exito BIT,
    mensaje VARCHAR(100)
);
GO
-------REGISTRAR AUDITORIA

CREATE OR ALTER PROCEDURE SP_Auditar_Login
    @codOperativo VARCHAR(15),
    @exito BIT,
    @mensaje VARCHAR(100),
    @ip VARCHAR(40) = NULL
AS
BEGIN
    INSERT INTO AuditoriaLogin (codOperativo, exito, mensaje, ip)
    VALUES (@codOperativo, @exito, @mensaje, @ip);
END;
GO





-- =============================================
-- FIN DEL SCRIPT
-- =============================================

