package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.SinhVien;
import com.example.demo.service.StudentService;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    @Autowired
    private StudentService studentService;   
    
    @GetMapping
    public List<SinhVien> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getSVFromUserId(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !auth.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("chua dang nhap");
        }

        String currUsername = auth.getName();
        try{
            Optional<SinhVien> sinhVien = studentService.getStudentProfileByUsername(currUsername);
            return ResponseEntity.ok(sinhVien);
        }catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public SinhVien createStudent(@RequestBody SinhVien student) {
        return studentService.createStudent(student);
    }

    @PutMapping("/{id}")
    public SinhVien updateStudent(@PathVariable String id, @RequestBody SinhVien studentDetails) {
        return studentService.updateStudent(id, studentDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteStudent(@PathVariable String id) {
        studentService.deleteStudent(id);
    }
}