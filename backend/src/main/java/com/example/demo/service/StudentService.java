package com.example.demo.service;

import com.example.demo.entity.SinhVien;
import com.example.demo.entity.User;
import com.example.demo.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<SinhVien> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<SinhVien> getStudentById(String id) {
        return studentRepository.findById(id);
    }

    @Transactional
    public SinhVien createStudent(SinhVien student) {
        if(studentRepository.existsById(student.getMssv())){
            throw new RuntimeException("Lỗi: MSSV đã tồn tại");
        }
        User nUser=new User();
        nUser.setUsername(student.getMssv());
        nUser.setPassword(passwordEncoder.encode(student.getMssv()));
        nUser.setName(student.getHo()+" "+student.getTen());
        nUser.setRole("ROLE_USER");

        student.setUser(nUser);

        return studentRepository.save(student);
    }

    public SinhVien updateStudent(String id, SinhVien studentDetails) {
        Optional<SinhVien> student = studentRepository.findById(id);
        if (student.isPresent()) {
            SinhVien existingStudent = student.get();
            existingStudent.setHo(studentDetails.getHo());
            existingStudent.setTen(studentDetails.getTen());
            existingStudent.setNgaysinh(studentDetails.getNgaysinh());
            existingStudent.setGioitinh(studentDetails.isGioitinh());
            existingStudent.setDiachi(studentDetails.getDiachi());
            existingStudent.setNghihoc(studentDetails.isNghihoc());
            existingStudent.setLop(studentDetails.getLop());

            if(existingStudent.getUser()!=null){
                existingStudent.getUser().setName(studentDetails.getHo()+" "+studentDetails.getTen());
            }
            return studentRepository.save(existingStudent);
        }
        return null;
    }
    @Transactional
    public void deleteStudent(String id) {
        studentRepository.deleteById(id);
    }

    public Optional<SinhVien> getStudentProfileByUsername(String username){
        return studentRepository.findByUserUsername(username);
    }


}
