package fr.alma.trivial_pursuit_server.data;

import fr.alma.trivial_pursuit_server.core.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
