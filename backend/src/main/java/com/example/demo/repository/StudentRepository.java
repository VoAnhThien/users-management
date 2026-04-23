package com.example.demo.repository;

import com.example.demo.entity.SinhVien;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<SinhVien, String> {
    boolean existsById(String mssv);

    Optional<SinhVien> findByUserUsername(String username);
}
