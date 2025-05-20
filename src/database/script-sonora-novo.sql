CREATE DATABASE IF NOT EXISTS sonora;
USE sonora;

CREATE TABLE IF NOT EXISTS Usuario(
idUsuario int primary key auto_increment,
empresa varchar(45),
cnpj char(18),
nome varchar(45),
celular char(15),
email varchar(200),
senha varchar(35)
);

/*
CREATE TABLE Artista (
    idArtista INT PRIMARY KEY auto_increment,
    idSpotify VARCHAR(50),
    nome VARCHAR(100),
    popularidade INT,
    seguidores INT,
    urlSpotify VARCHAR(255),
    dtRequisicao DATE
);

CREATE TABLE Genero (
    idGenero INT PRIMARY KEY auto_increment,
    nome VARCHAR(50)
);

CREATE TABLE genero_artistas (
    idGenero INT,
    idArtista INT,
    PRIMARY KEY (idGenero, idArtista),
    FOREIGN KEY (idGenero) REFERENCES Genero(idGenero),
    FOREIGN KEY (idArtista) REFERENCES Artista(idArtista)
);

CREATE TABLE Lineup (
    idUsuario INT,
    idArtista INT,
    nomeLineup VARCHAR(45),
    generos VARCHAR(255),
    favorito TINYINT,
    PRIMARY KEY (idUsuario, idArtista),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    FOREIGN KEY (idArtista) REFERENCES Artista(idArtista)
);

CREATE TABLE Artistas_relacionados (
    idArtista INT,
    relacionado_id INT,
    PRIMARY KEY (idArtista, relacionado_id),
    FOREIGN KEY (idArtista) REFERENCES Artista(idArtista),
    FOREIGN KEY (relacionado_id) REFERENCES Artista(idArtista)
);
*/
