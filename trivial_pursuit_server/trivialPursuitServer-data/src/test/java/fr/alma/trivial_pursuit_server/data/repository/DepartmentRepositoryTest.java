package fr.alma.trivial_pursuit_server.data.repository;

import fr.alma.trivial_pursuit_server.core.Department;
import fr.alma.trivial_pursuit_server.core.Employee;
import fr.alma.trivial_pursuit_server.data.configuration.DataTestConfiguration;
import fr.alma.trivial_pursuit_server.data.repository.DepartmentRepository;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

import java.util.ArrayList;
import java.util.List;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(
        classes = {DataTestConfiguration.class},
        loader = AnnotationConfigContextLoader.class)
@Transactional
class DepartmentRepositoryTest {

    @Resource
    private DepartmentRepository departmentRepository;

    @Test
    @DisplayName("test add")
    void testAdd(){
        Department d = new Department("dep");
        Employee e = new Employee("e1",d);
        List<Employee> le = new ArrayList<>();
        le.add(e);
        d.setEmployees(le);

        departmentRepository.save(d);

        //VERIFY
        Assertions.assertTrue(d.getEmployees().contains(e));
        Assertions.assertTrue(departmentRepository.findAll().contains(d));
        Assertions.assertTrue(departmentRepository.findAll().get(0).getEmployees().contains(e));
        Assertions.assertEquals("e1", departmentRepository.findAll().get(0).getEmployees().get(0).getName());
        Assertions.assertEquals(d, departmentRepository.findAll().get(0).getEmployees().get(0).getDepartment());
        Assertions.assertEquals("dep", departmentRepository.findAll().get(0).getName());
    }

    @Test
    @DisplayName("test delete")
    void testDelete(){
        Department d = new Department("dep");
        Employee e = new Employee("e1",d);
        List<Employee> le = new ArrayList<>();
        le.add(e);
        d.setEmployees(le);

        departmentRepository.save(d);
        e.setDepartment(null);
        d.setEmployees(new ArrayList<>());
        departmentRepository.delete(d);


        //VERIFY
        Assertions.assertFalse(d.getEmployees().contains(e));
        Assertions.assertFalse(departmentRepository.findAll().contains(d));
        Assertions.assertEquals(0, departmentRepository.count());
    }
}
