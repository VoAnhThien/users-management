package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.MonHoc;

@Repository
public interface MonHocRepository extends JpaRepository<MonHoc, String> {
    boolean existsById(String mamh);

}