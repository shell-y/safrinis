package school.sptech;

import java.util.List;

public class Artista {
    private String id;
    private String nome;
    private String fkRelacionadoA;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getFkRelacionadoA() {
        return fkRelacionadoA;
    }

    public void setFkRelacionadoA(String fkRelacionadoA) {
        this.fkRelacionadoA = fkRelacionadoA;
    }

    public Artista() {
    }

    public Artista(String id, String nome, String fkRelacionadoA) {
        this.id = id;
        this.nome = nome;
        this.fkRelacionadoA = fkRelacionadoA;
    }

    @Override
    public String toString() {
        return "Artista{" +
                "id='" + id + '\'' +
                ", nome='" + nome + '\'' +
                ", fkRelacionadoA='" + fkRelacionadoA + '\'' +
                '}';
    }
}
