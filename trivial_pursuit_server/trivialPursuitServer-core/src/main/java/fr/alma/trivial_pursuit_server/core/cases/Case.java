package fr.alma.trivial_pursuit_server.core.cases;

import fr.alma.trivial_pursuit_server.exception.CaseException;
import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Constant;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.util.List;

@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter(AccessLevel.PUBLIC)
//@Setter(AccessLevel.PROTECTED)
public class Case {

    private String name;
    private Color color;
    private List<String> neighbors;

    /**
     * Setter on the field neighbors.
     * Check if the parameter contains the correct number of neighbors possible and that it's not null
     * @param neighbors the list of neighbors
     * @throws CaseException if neighbors doesn't respect the specification
     */
    public void setNeighbors(List<String> neighbors) throws CaseException {
        if(neighbors != null && neighbors.size()>= Constant.CASE_MIN_NEIGHBORS && neighbors.size()<= Constant.CASE_MAX_NEIGHBORS){
            this.neighbors = neighbors;
        }else{
            throw new CaseException("neighbors can't be set because it size doesn't match or it's null");
        }
    }
}
