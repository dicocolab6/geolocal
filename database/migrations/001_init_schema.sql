BEGIN;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- ADMIN USERS
-- =========================
CREATE TABLE IF NOT EXISTS admin_users (
    id_admin SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT now()
);

-- =========================
-- PARENTES
-- =========================
CREATE TABLE IF NOT EXISTS parentes (
    id_par SERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL,
    senha VARCHAR(128) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usr INTEGER NOT NULL,
    CONSTRAINT fk_parentes_usuario
        FOREIGN KEY (id_usr)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================
-- RELACOES
-- =========================
CREATE TABLE IF NOT EXISTS relacoes (
    id_rel SERIAL PRIMARY KEY,
    id_par INTEGER NOT NULL,
    id_usr INTEGER NOT NULL,
    coord_x DOUBLE PRECISION NOT NULL,
    coord_y DOUBLE PRECISION NOT NULL,
    capturado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_relacoes_parente
        FOREIGN KEY (id_par)
        REFERENCES parentes(id_par)
        ON DELETE CASCADE,
    CONSTRAINT fk_relacoes_usuario
        FOREIGN KEY (id_usr)
        REFERENCES users(id)
        ON DELETE CASCADE
);


COMMIT;
