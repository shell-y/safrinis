CREATE DATABASE Sonora;
USE Sonora;

-- Tabela Empresa
CREATE TABLE Empresa (
    idEmpresa INT PRIMARY KEY AUTO_INCREMENT,
    nomeFantasia VARCHAR(45),
    cnpj CHAR(14),
    emailCorporativo VARCHAR(200)
);

INSERT INTO Empresa VALUES 
    (DEFAULT, "Empresa", "00000000000000", "empresa@empresa.com");

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

INSERT INTO Usuario VALUE 
    (DEFAULT, "João", "11912341234", "joao@empresa.com", "Empresa@123", 1);

-- Tabela Artista
CREATE TABLE Artista (
    idArtista INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100),
    fkRelacionadoA INT,
    FOREIGN KEY (fkRelacionadoA) REFERENCES Artista(idArtista)
);

INSERT INTO Artista VALUE 
    (DEFAULT, "Artista", 1);

-- Tabela Lineup
CREATE TABLE Lineup (
    idLineup INT PRIMARY KEY AUTO_INCREMENT,
    fkUsuario INT,
    nomeLineup VARCHAR(45),
    FOREIGN KEY (fkUsuario) REFERENCES Usuario(idUsuario)
);

INSERT INTO Lineup VALUES
    (DEFAULT, 1, "LineUp 1"),
    (DEFAULT, 1, "LineUp 2");

-- Tabela LineupArtista
CREATE TABLE LineupArtista (
    fkLineup INT,
    fkArtista INT,
    PRIMARY KEY (fkLineup, fkArtista),
    FOREIGN KEY (fkLineup) REFERENCES Lineup(idLineup),
    FOREIGN KEY (fkArtista) REFERENCES Artista(idArtista)
);

INSERT INTO LineupArtista VALUES
    (1, 1),
    (2, 1);

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


/*

SELECT 
    idLineup, nomeLineup,
    l.fkUsuario as idUsuario,
    a.nome as nomeArtista
FROM 
    Lineup as l
JOIN LineupArtista as la
    ON  la.fkLineup = l.idLineup AND la.fkUsuario = l.fkUsuario
JOIN Artista as a
    ON a.idArtista = la.fkArtista;


SELECT
    idArtista,
    a.nome as nomeArtista, 
    count(la.fkArtista) as qtdLineups
        FROM Artista as a
        LEFT JOIN LineupArtista as la
            ON la.fkArtista = a.idArtista
        GROUP BY
            idArtista, nomeArtista;
*/
