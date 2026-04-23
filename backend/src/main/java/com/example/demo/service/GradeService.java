package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Grade;
import com.example.demo.entity.GradeId;
import com.example.demo.repository.GradeRepository;

@Service
public class GradeService {
    @Autowired
    private GradeRepository gradeRepository;

    public Grade createGrade(Grade grade) {
        return gradeRepository.save(grade);
    }

    public List<Grade> getGradesByStudentId(String mssv) {
        return gradeRepository.findBySinhVienMssv(mssv);
    }

    public void deleteDiem(String mssv, String mamh, int lan){
        GradeId id =new GradeId();
        id.setMssv(mssv);
        id.setMamh(mamh);
        id.setLan(lan);
        if(!gradeRepository.existsById(id)){
            throw new RuntimeException("Khong tim thay diem cua sinh vien hop le");
        }
        gradeRepository.deleteById(id);
    }
}
