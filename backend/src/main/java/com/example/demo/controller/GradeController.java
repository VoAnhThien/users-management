package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.GradeDTO;
import com.example.demo.entity.Grade;
import com.example.demo.entity.GradeId;
import com.example.demo.entity.MonHoc;
import com.example.demo.entity.SinhVien;
import com.example.demo.service.GradeService;
import com.example.demo.service.MonHocService;
import com.example.demo.service.StudentService;

@RestController
@RequestMapping("/api/grades")
public class GradeController {
    @Autowired
    private GradeService gradeService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private MonHocService monHocService;
    
    @GetMapping("/student/{mssv}")
    public ResponseEntity<List<Grade>> getGradesByStudentId(@PathVariable String mssv) {
        List<Grade> grades = gradeService.getGradesByStudentId(mssv);
        return ResponseEntity.ok(grades);
    }

    @PostMapping
    public ResponseEntity<Grade> createGrade(@RequestBody GradeDTO gradeDto) {
        GradeId gradeId = new GradeId();
        gradeId.setMssv(gradeDto.getMssv());
        gradeId.setMamh(gradeDto.getMamh());
        gradeId.setLan(gradeDto.getLan());

        Optional<SinhVien> sinhVien = studentService.getStudentById(gradeDto.getMssv());
        Optional<MonHoc> monHoc = monHocService.getMonHocById(gradeDto.getMamh());

        Grade grade = new Grade();
        grade.setId(gradeId);
        grade.setSinhVien(sinhVien.orElse(null));
        grade.setMonHoc(monHoc.orElse(null));
        grade.setHocky(gradeDto.getHocky());
        grade.setDiem(gradeDto.getDiem());
        Grade createdGrade = gradeService.createGrade(grade);
        return ResponseEntity.ok(createdGrade);
    }

    @PutMapping("/{mssv}/{mamh}/{lan}")
    public ResponseEntity<Grade> updateGrade(@PathVariable String mssv, @PathVariable String mamh, @PathVariable int lan, @RequestBody GradeDTO gradeDto) {
        GradeId gradeId = new GradeId();
        gradeId.setMssv(mssv);
        gradeId.setMamh(mamh);
        gradeId.setLan(lan);

        Grade grade = new Grade();
        grade.setId(gradeId);
        grade.setHocky(gradeDto.getHocky());
        grade.setDiem(gradeDto.getDiem());
        Grade updatedGrade = gradeService.createGrade(grade);
        return ResponseEntity.ok(updatedGrade);
    }

    @DeleteMapping("/{mssv}/{mamh}/{lan}")
    public ResponseEntity<?> deleteDiem(
        @PathVariable String mssv,
        @PathVariable String mamh,
        @PathVariable int lan){
            try{
                gradeService.deleteDiem(mssv, mamh, lan);
                return ResponseEntity.ok("Xoa thanh cong");
            }catch(RuntimeException e){
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }
    
}
