package school.sptech.artistas;

import school.sptech.Artista;

public class ArtistaLastFM extends Artista {

    private String idPlataforma;
    private String dataColeta;
    private Integer ouvintes;
    private Integer plays;
    private Integer totalPlays;
    private Integer onTour;
    private Integer fkArtista;

    public String getIdPlataforma() {
        return idPlataforma;
    }

    public void setIdPlataforma(String idPlataforma) {
        this.idPlataforma = idPlataforma;
    }

    public String getDataColeta() {
        return dataColeta;
    }

    public void setDataColeta(String dataColeta) {
        this.dataColeta = dataColeta;
    }

    public Integer getOuvintes() {
        return ouvintes;
    }

    public void setOuvintes(Integer ouvintes) {
        this.ouvintes = ouvintes;
    }

    public Integer getPlays() {
        return plays;
    }

    public void setPlays(Integer plays) {
        this.plays = plays;
    }

    public Integer getTotalPlays() {
        return totalPlays;
    }

    public void setTotalPlays(Integer totalPlays) {
        this.totalPlays = totalPlays;
    }

    public Integer getOnTour() {
        return onTour;
    }

    public void setOnTour(Integer onTour) {
        this.onTour = onTour;
    }

    public Integer getFkArtista() {
        return fkArtista;
    }

    public void setFkArtista(Integer fkArtista) {
        this.fkArtista = fkArtista;
    }

    public ArtistaLastFM() {
    }

    public ArtistaLastFM(String idPlataforma, String dataColeta, Integer ouvintes, Integer plays, Integer totalPlays, Integer onTour, Integer fkArtista) {
        this.idPlataforma = idPlataforma;
        this.dataColeta = dataColeta;
        this.ouvintes = ouvintes;
        this.plays = plays;
        this.totalPlays = totalPlays;
        this.onTour = onTour;
        this.fkArtista = fkArtista;
    }

    public ArtistaLastFM(String id, String nome, String fkRelacionadoA, String idPlataforma, String dataColeta, Integer ouvintes, Integer plays, Integer totalPlays, Integer onTour, Integer fkArtista) {
        super(id, nome, fkRelacionadoA);
        this.idPlataforma = idPlataforma;
        this.dataColeta = dataColeta;
        this.ouvintes = ouvintes;
        this.plays = plays;
        this.totalPlays = totalPlays;
        this.onTour = onTour;
        this.fkArtista = fkArtista;
    }

    @Override
    public String toString() {
        return "ArtistaLastFM{" +
                "idPlataforma='" + idPlataforma + '\'' +
                ", dataColeta='" + dataColeta + '\'' +
                ", ouvintes=" + ouvintes +
                ", plays=" + plays +
                ", totalPlays=" + totalPlays +
                ", onTour=" + onTour +
                ", fkArtista=" + fkArtista +
                '}';
    }
}
