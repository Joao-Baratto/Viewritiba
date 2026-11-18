-- Tabelas deduzidas a partir dos PHP/telas (não existiam em nenhum .sql do projeto).
USE viewritiba;

CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT NOT NULL AUTO_INCREMENT,
    nome_categoria VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_categoria),
    UNIQUE KEY uq_categoria_nome (nome_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS evento_categoria (
    id_evento INT NOT NULL,
    id_categoria INT NOT NULL,
    PRIMARY KEY (id_evento, id_categoria),
    KEY idx_ec_categoria (id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS favorito (
    id_favorito INT NOT NULL AUTO_INCREMENT,
    tipo_conta VARCHAR(20) NOT NULL,
    id_usuario INT NOT NULL,
    id_evento INT NOT NULL,
    observacao TEXT NULL,
    PRIMARY KEY (id_favorito),
    UNIQUE KEY uq_favorito (tipo_conta, id_usuario, id_evento),
    KEY idx_favorito_evento (id_evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comentario (
    id INT NOT NULL AUTO_INCREMENT,
    id_evento INT NOT NULL,
    usuario VARCHAR(255) NOT NULL,
    comentario TEXT NOT NULL,
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_comentario_evento (id_evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS avaliacao_comentario (
    id_comentario INT NOT NULL AUTO_INCREMENT,
    id_evento INT NOT NULL,
    tipo_conta VARCHAR(20) NOT NULL,
    id_usuario INT NOT NULL,
    texto TEXT NOT NULL,
    nota TINYINT NOT NULL,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_comentario),
    KEY idx_avaliacao_evento (id_evento),
    KEY idx_avaliacao_usuario (tipo_conta, id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS compartilhamento (
    id_compartilhamento INT NOT NULL AUTO_INCREMENT,
    id_evento INT NOT NULL,
    id_remetente INT NOT NULL,
    tipo_remetente VARCHAR(20) NOT NULL,
    id_destinatario INT NOT NULL,
    tipo_destinatario VARCHAR(20) NOT NULL,
    mensagem VARCHAR(200) NULL,
    data_compartilhamento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_compartilhamento),
    UNIQUE KEY uq_compartilhamento (id_evento, id_remetente, tipo_remetente, id_destinatario, tipo_destinatario),
    KEY idx_comp_destinatario (tipo_destinatario, id_destinatario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO categoria (nome_categoria) VALUES
 ('Música'),('Tecnologia'),('Esporte'),('Gastronomia'),('Arte'),('Educação');
