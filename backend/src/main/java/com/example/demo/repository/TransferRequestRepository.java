package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.TransferRequest;

@Repository
public interface TransferRequestRepository extends JpaRepository<TransferRequest,String> {
    List<TransferRequest> findByStatus(String status);
}
