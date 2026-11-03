CREATE DATABASE IF NOT EXISTS viewritiba;

USE viewritiba;

CREATE TABLE IF NOT EXISTS organizador (
  id int(11) NOT NULL AUTO_INCREMENT,
  
  nome varchar(100) NOT NULL,
  documento varchar(20) NOT NULL,
  email varchar(100) NOT NULL,
  telefone varchar(20) NOT NULL,
  bio text DEFAULT NULL,
  senha varchar(255) NOT NULL,
  
  PRIMARY KEY (id),
  
  UNIQUE KEY (documento),
  UNIQUE KEY (email)
);

CREATE TABLE IF NOT EXISTS participante (
  id int(11) NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  documento varchar(20) NOT NULL,
  email varchar(100) NOT NULL,
  telefone varchar(20) NOT NULL,
  senha varchar(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_participante_documento (documento),
  UNIQUE KEY uq_participante_email (email)
);

CREATE TABLE IF NOT EXISTS conta_banimento (
  tipo_conta enum('organizador','participante') NOT NULL,
  id_conta int(11) NOT NULL,
  motivo text NOT NULL,
  banido_em datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (tipo_conta, id_conta),
  KEY idx_conta_banimento_data (banido_em)
);