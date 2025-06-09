package school.sptech.artistas;

import school.sptech.Artista;

public class ArtistaSpotify extends Artista {

    private String identificadorSpotify;
    private Integer popularidade;
    private Integer seguidores;
    private String dtRequisicao;
    private Integer fkArtista;

    public String getIdentificadorSpotify() {
        return identificadorSpotify;
    }

    public void setIdentificadorSpotify(String identificadorSpotify) {
        this.identificadorSpotify = identificadorSpotify;
    }

    public Integer getPopularidade() {
        return popularidade;
    }

    public void setPopularidade(Integer popularidade) {
        this.popularidade = popularidade;
    }

    public Integer getSeguidores() {
        return seguidores;
    }

    public void setSeguidores(Integer seguidores) {
        this.seguidores = seguidores;
    }

    public String getDtRequisicao() {
        return dtRequisicao;
    }

    public void setDtRequisicao(String dtRequisicao) {
        this.dtRequisicao = dtRequisicao;
    }

    public Integer getFkArtista() {
        return fkArtista;
    }

    public void setFkArtista(Integer fkArtista) {
        this.fkArtista = fkArtista;
    }

    public ArtistaSpotify() {
    }

    public ArtistaSpotify(String indentificadorSpotify, Integer popularidade, Integer seguidores, String dtRequisicao, Integer fkArtista) {
        this.identificadorSpotify = indentificadorSpotify;
        this.popularidade = popularidade;
        this.seguidores = seguidores;
        this.dtRequisicao = dtRequisicao;
        this.fkArtista = fkArtista;
    }

    public ArtistaSpotify(String id, String nome, String fkRelacionadoA, String indentificadorSpotify, Integer popularidade, Integer seguidores, String dtRequisicao, Integer fkArtista) {
        super(id, nome, fkRelacionadoA);
        this.identificadorSpotify = indentificadorSpotify;
        this.popularidade = popularidade;
        this.seguidores = seguidores;
        this.dtRequisicao = dtRequisicao;
        this.fkArtista = fkArtista;
    }

    @Override
    public String toString() {
        return "ArtistaSpotify{" +
                "indentificadorSpotify='" + identificadorSpotify + '\'' +
                ", popularidade=" + popularidade +
                ", seguidores=" + seguidores +
                ", dtRequisicao='" + dtRequisicao + '\'' +
                ", fkArtista=" + fkArtista +
                '}';
    }
}
