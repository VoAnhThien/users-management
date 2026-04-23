package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Grade;
import com.example.demo.entity.GradeId;

@Repository
public interface GradeRepository extends JpaRepository<Grade, GradeId> {
    List<Grade> findBySinhVienMssv(String mssv);
}
