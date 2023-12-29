package fr.alma.trivial_pursuit_server.core.cases;

import fr.alma.trivial_pursuit_server.exception.CaseException;
import fr.alma.trivial_pursuit_server.util.Color;
import jakarta.persistence.Embeddable;

import java.util.List;

@Embeddable
public class Case {

    private String name;
    private Color color;

    private List<String> neighbors;

    protected Case(){}

    protected Case(String name, Color color, List<String> neighbors) {
        this.name = name;
        this.color = color;
        this.neighbors = neighbors;
    }

    protected String getName() {
        return this.name;
    }

    protected Color getColor(){
        return this.color;
    }

    public List<String> getNeighbors() {
        return neighbors;
    }

    public void setNeighbors(List<String> neighbors) throws CaseException {
        if(neighbors != null){
            if(neighbors.size()>=2 && neighbors.size()<=6)
                this.neighbors = neighbors;
            else
                throw new CaseException();
        }else{
            throw new CaseException();
        }
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setColor(Color color) {
        this.color = color;
    }
}
