CREATE DATABASE Sonora;
USE Sonora;

-- Tabela Empresa
CREATE TABLE Empresa (
    idEmpresa INT PRIMARY KEY AUTO_INCREMENT,
    nomeFantasia VARCHAR(45),
    cnpj CHAR(14),
    emailCorporativo VARCHAR(200)
);

INSERT INTO Empresa VALUES (DEFAULT, "Sonora", "00000000000000", "sonora@sonora.com");

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
    nome VARCHAR(100),
    foto MEDIUMBLOB,
    fkRelacionadoA INT,
    FOREIGN KEY (fkRelacionadoA) REFERENCES Artista(idArtista)
);

-- Tabela Lineup
CREATE TABLE Lineup (
    fkArtista INT,
    nomeLineup VARCHAR(45),
    generos VARCHAR(45),
    favorito TINYINT,
    fkUsuario INT,
    PRIMARY KEY (fkArtista, fkUsuario),
    FOREIGN KEY (fkArtista) REFERENCES Artista(idArtista),
    FOREIGN KEY (fkUsuario) REFERENCES Usuario(idUsuario)
);

-- Tabela Notificacao
CREATE TABLE Notificacao (
    idNotificacao INT PRIMARY KEY AUTO_INCREMENT,
    canal VARCHAR(45),
    mensagem TEXT,
    dataEnvio DATETIME,
    fkLineup INT,
    FOREIGN KEY (fkLineup) REFERENCES Lineup(fkArtista) -- Referência ao artista (ajuste conforme necessidade)
);

-- Tabela Spotify
CREATE TABLE Spotify (
    idSpotify INT PRIMARY KEY AUTO_INCREMENT,
    identificadorSpotify VARCHAR(200),
    urlSpotify VARCHAR(255),
    popularidade INT,
    dtRequisicao DATE,
    fkArtista INT,
    FOREIGN KEY (fkArtista) REFERENCES Artista(idArtista)
);

-- Tabela LastFm
CREATE TABLE LastFm (
    idPlays INT PRIMARY KEY AUTO_INCREMENT,
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
    mensagem VARCHAR(255),
    dataHora DATETIME,
    tipoStatus VARCHAR(45)
);


