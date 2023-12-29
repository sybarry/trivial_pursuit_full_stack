package fr.alma.trivial_pursuit_server.core;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Table(name = "DEPARTMENT")
@Entity
public class Department {
    private Long id;
    private String name;
    private List<Employee> employees = new ArrayList<>();

    public Department() {
        super();
    }

    public Department(String name) {
        this.name = name;
    }

    @Id
    @GeneratedValue
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Column(name = "NAME")
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @OneToMany(mappedBy = "department", cascade = CascadeType.PERSIST)
    public List<Employee> getEmployees() {
        return employees;
    }

    public void setEmployees(List<Employee> employees) {
        this.employees = employees;
    }
}
