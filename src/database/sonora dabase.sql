CREATE DATABASE IF NOT EXISTS Sonora;
USE Sonora;
-- drop database Sonora;
-- Tabela Empresa
CREATE TABLE Empresa (
    idEmpresa INT PRIMARY KEY AUTO_INCREMENT,
    nomeFantasia VARCHAR(45),
    cnpj CHAR(14),
    emailCorporativo VARCHAR(200)
);

-- Tabela Usuario
CREATE TABLE Usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    nomeUsuario VARCHAR(200),
    celular CHAR(11),
    email VARCHAR(200),
    senha VARCHAR(35),
    fkEmpresa INT,
    FOREIGN KEY (fkEmpresa) REFERENCES Empresa(idEmpresa)
);

-- Tabela Artista
CREATE TABLE Artista (
    idArtista INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    fkRelacionadoA INT NULL,
    FOREIGN KEY (fkRelacionadoA) REFERENCES Artista(idArtista)
);

-- Tabela Lineup
CREATE TABLE Lineup (
    idLineup INT AUTO_INCREMENT,
    fkUsuario INT,
    nomeLineup VARCHAR(45),
    PRIMARY KEY (idLineup, fkUsuario),
    FOREIGN KEY (fkUsuario) REFERENCES Usuario(idUsuario)
);

-- Tabela LineupArtista
CREATE TABLE LineupArtista (
    fkLineup INT,
    fkArtista INT,
    PRIMARY KEY (fkLineup, fkArtista),
    FOREIGN KEY (fkLineup) REFERENCES Lineup(idLineup) ON DELETE CASCADE,
    FOREIGN KEY (fkArtista) REFERENCES Artista(idArtista) ON DELETE CASCADE
);

-- Tabela Notificacao (corrigida: referência correta ao Lineup)
CREATE TABLE Notificacao (
    idNotificacao INT PRIMARY KEY AUTO_INCREMENT,
    canal VARCHAR(45),
    mensagem TEXT,
    dataEnvio DATETIME,
    fkLineup INT,
    fkUsuario INT,
    FOREIGN KEY (fkLineup, fkUsuario) REFERENCES Lineup(idLineup, fkUsuario)
);

-- Tabela Spotify
CREATE TABLE Spotify (
    idSpotify INT PRIMARY KEY AUTO_INCREMENT,
    identificadorSpotify VARCHAR(200),
    popularidade INT,
    seguidores INT,
    dtRequisicao DATE,
    fkArtista INT,
    FOREIGN KEY (fkArtista) REFERENCES Artista(idArtista)
);

-- Tabela LastFm
CREATE TABLE LastFm (
    idPlays INT PRIMARY KEY AUTO_INCREMENT,
    idPlataforma VARCHAR(200),
    dataColeta DATE,
    ouvintes INT,
    plays INT,
    totalPlays INT,
    onTour TINYINT,
    fkArtista INT,
    FOREIGN KEY (fkArtista) REFERENCES Artista(idArtista)
);

-- Tabela LogExecucao
CREATE TABLE LogExecucao (
    idLog INT PRIMARY KEY AUTO_INCREMENT,
    status VARCHAR(45),
    classe varchar(255),
    mensagem VARCHAR(255),
    dataHora DATETIME
);

-- Consultas
SELECT * FROM Artista;
SELECT * FROM Spotify;
SELECT * FROM LastFm;
SELECT * FROM LogExecucao;
DESC Lineup;

show tables;

