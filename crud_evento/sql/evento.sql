CREATE DATABASE IF NOT EXISTS viewritiba;

USE viewritiba;

CREATE TABLE IF NOT EXISTS evento (
    id INT NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    data_hora DATETIME NOT NULL,
    local VARCHAR(255) NOT NULL,
    id_organizador INT NOT NULL,
    PRIMARY KEY (id),
    KEY idx_evento_organizador_data (id_organizador, data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
