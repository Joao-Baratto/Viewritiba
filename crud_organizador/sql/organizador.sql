CREATE DATABASE IF NOT EXISTS viewritiba;

USE viewritiba;

CREATE TABLE organizador (
  id int(11) NOT NULL AUTO_INCREMENT,
  
  nome varchar(100) NOT NULL,
  documento varchar(20) NOT NULL,
  email varchar(100) NOT NULL,
  telefone varchar(20) NOT NULL,
  senha varchar(255) NOT NULL,
  
  PRIMARY KEY (id),
  
  UNIQUE KEY (documento),
  UNIQUE KEY (email)
);

SELECT * FROM organizador;